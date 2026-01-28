import { Request, Response, NextFunction } from 'express';
import { Logger } from '@umkmpro/utils';

const logger = new Logger('ErrorMiddleware');

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error occurred', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
}
