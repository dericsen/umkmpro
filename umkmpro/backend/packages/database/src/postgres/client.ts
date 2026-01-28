import { Pool, PoolConfig } from 'pg';

export class PostgresClient {
  private pool: Pool;
  private static instance: PostgresClient;

  private constructor(config: PoolConfig) {
    this.pool = new Pool({
      host: config.host || process.env.POSTGRES_HOST,
      port: config.port || parseInt(process.env.POSTGRES_PORT || '5432'),
      user: config.user || process.env.POSTGRES_USER,
      password: config.password || process.env.POSTGRES_PASSWORD,
      database: config.database || process.env.POSTGRES_DB,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  public static getInstance(config?: PoolConfig): PostgresClient {
    if (!PostgresClient.instance) {
      PostgresClient.instance = new PostgresClient(config || {});
    }
    return PostgresClient.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error', { text, error });
      throw error;
    }
  }

  public async getClient() {
    return await this.pool.connect();
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export default PostgresClient;
