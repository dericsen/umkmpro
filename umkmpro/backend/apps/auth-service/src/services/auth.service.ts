import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PostgresClient } from '@umkmpro/database';
import { RedisClient } from '@umkmpro/database';
import { Logger } from '@umkmpro/utils';
import { RegisterDTO, LoginResponseDTO } from '@umkmpro/types';

export class AuthService {
  private db;
  private redis;
  private logger: Logger;

  constructor() {
    this.db = PostgresClient.getInstance().getPool();
    this.redis = RedisClient.getInstance().getClient();
    this.logger = new Logger('AuthService');
  }

  async register(data: RegisterDTO): Promise<LoginResponseDTO> {
    const { email, password, full_name, phone } = data;

    // Check if user exists
    const existing = await this.db.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existing.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await this.db.query(
      `INSERT INTO users (id, email, phone, password_hash, full_name, email_verified, status)
       VALUES ($1, $2, $3, $4, $5, false, 'active')
       RETURNING id, email, full_name`,
      [uuidv4(), email, phone, password_hash, full_name]
    );

    const user = result.rows[0];

    // Generate tokens
    const tokens = this.generateTokens(user.id, email);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string): Promise<LoginResponseDTO> {
    // Get user
    const result = await this.db.query(
      'SELECT id, email, full_name, password_hash, status FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      ...tokens,
    };
  }

  async refreshToken(refresh_token: string): Promise<Omit<LoginResponseDTO, 'user'>> {
    try {
      const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET!) as any;
      
      // Generate new tokens
      return this.generateTokens(decoded.userId, decoded.email);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<void> {
    // Add token to blacklist
    const decoded = jwt.decode(token) as any;
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redis.setex(`blacklist:${token}`, ttl, '1');
      }
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      await this.db.query(
        'UPDATE users SET email_verified = true WHERE id = $1',
        [decoded.userId]
      );
    } catch (error) {
      throw new Error('Invalid verification token');
    }
  }

  private generateTokens(userId: string, email: string) {
    const access_token = jwt.sign(
      { userId, email, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refresh_token = jwt.sign(
      { userId, email, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
    );

    const decoded = jwt.decode(access_token) as any;
    const expires_in = decoded.exp - decoded.iat;

    return {
      access_token,
      refresh_token,
      expires_in,
    };
  }
}
