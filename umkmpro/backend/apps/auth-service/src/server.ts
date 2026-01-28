import express from 'express';
import dotenv from 'dotenv';
import { Logger } from '@umkmpro/utils';
import { authRouter } from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const logger = new Logger('Auth-Service');
const PORT = process.env.PORT || 4001;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Routes
app.use('/auth', authRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Auth Service running on port ${PORT}`);
});

export default app;
