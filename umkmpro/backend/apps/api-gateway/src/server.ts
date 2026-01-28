import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Logger } from '@umkmpro/utils';

dotenv.config();

const app = express();
const logger = new Logger('API-Gateway');
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date() });
});

// Service proxies
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  finance: process.env.FINANCE_SERVICE_URL || 'http://localhost:4002',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:4003',
  crm: process.env.CRM_SERVICE_URL || 'http://localhost:4004',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4005',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:8001',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4006',
};

// Proxy middleware for each service
Object.entries(services).forEach(([name, url]) => {
  app.use(`/api/v1/${name}`, createProxyMiddleware({
    target: url,
    changeOrigin: true,
    pathRewrite: { [`^/api/v1/${name}`]: '' },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${name}`, err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: `${name} service is currently unavailable`
        }
      });
    }
  }));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Service routes:', services);
});
