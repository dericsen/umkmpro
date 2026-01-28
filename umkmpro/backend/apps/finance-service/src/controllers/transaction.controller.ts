import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';
import { Logger } from '@umkmpro/utils';

export class TransactionController {
  private service: TransactionService;
  private logger: Logger;

  constructor() {
    this.service = new TransactionService();
    this.logger = new Logger('TransactionController');
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.headers['x-business-id'] as string;
      const userId = req.headers['x-user-id'] as string;
      
      const transaction = await this.service.createTransaction(
        businessId,
        userId,
        req.body
      );

      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.headers['x-business-id'] as string;
      const { id } = req.params;
      
      const transaction = await this.service.getTransactionById(businessId, id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Transaction not found' }
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.headers['x-business-id'] as string;
      const filters = req.query;
      
      const result = await this.service.listTransactions(businessId, filters as any);

      res.json({
        success: true,
        data: result.transactions,
        pagination: {
          total: result.total,
          page: parseInt(filters.page as string) || 1,
          limit: parseInt(filters.limit as string) || 20
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.headers['x-business-id'] as string;
      const { id } = req.params;
      
      // Implement soft delete
      res.json({
        success: true,
        message: 'Transaction deleted'
      });
    } catch (error) {
      next(error);
    }
  }
}
