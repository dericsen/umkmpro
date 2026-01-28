import Redis, { RedisOptions } from 'ioredis';

export class RedisClient {
  private client: Redis;
  private static instance: RedisClient;

  private constructor(config?: RedisOptions) {
    this.client = new Redis({
      host: config?.host || process.env.REDIS_HOST || 'localhost',
      port: config?.port || parseInt(process.env.REDIS_PORT || '6379'),
      password: config?.password || process.env.REDIS_PASSWORD,
      db: config?.db || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  public static getInstance(config?: RedisOptions): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient(config);
    }
    return RedisClient.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  // Cache helpers
  public async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  public async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.client.setex(key, ttl, value);
    }
    return await this.client.set(key, value);
  }

  public async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  public async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  // JSON helpers
  public async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  public async setJSON<T>(key: string, value: T, ttl?: number): Promise<'OK'> {
    const data = JSON.stringify(value);
    if (ttl) {
      return await this.client.setex(key, ttl, data);
    }
    return await this.client.set(key, data);
  }

  // Session helpers
  public async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    await this.setJSON(`session:${sessionId}`, data, ttl);
  }

  public async getSession<T>(sessionId: string): Promise<T | null> {
    return await this.getJSON<T>(`session:${sessionId}`);
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  public async incrementRateLimit(key: string, ttl: number): Promise<number> {
    const multi = this.client.multi();
    multi.incr(key);
    multi.expire(key, ttl);
    const results = await multi.exec();
    return results?.[0]?.[1] as number || 0;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.client.quit();
  }
}

export default RedisClient;
