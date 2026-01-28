import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

const router = Router();
const controller = new TransactionController();

router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export { router as transactionRouter };
