import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { Logger } from '@umkmpro/utils';

export class AuthController {
  private authService: AuthService;
  private logger: Logger;

  constructor() {
    this.authService = new AuthService();
    this.logger = new Logger('AuthController');
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, full_name, phone } = req.body;
      
      const result = await this.authService.register({
        email,
        password,
        full_name,
        phone
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      const result = await this.authService.login(email, password);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = req.body;
      
      const result = await this.authService.refreshToken(refresh_token);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        await this.authService.logout(token);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      
      await this.authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
