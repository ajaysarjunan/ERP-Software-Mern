import { Router, RequestHandler } from 'express';
import { authenticateToken, checkModuleAccess } from '../middleware/auth.middleware';
import {
  createSale,
  getAllSales,
  getSale,
  generateSalesReport
} from '../controllers/sale.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as RequestHandler);

// Apply sales module access check
router.use(checkModuleAccess('sales') as RequestHandler);

// Sale routes
router.post('/', createSale as RequestHandler);
router.get('/', getAllSales as RequestHandler);
router.get('/:id', getSale as RequestHandler);
router.post('/report', generateSalesReport as RequestHandler);

export default router; 