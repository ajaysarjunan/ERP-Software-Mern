import { Router, RequestHandler } from 'express';
import { authenticateToken, checkModuleAccess } from '../middleware/auth.middleware';
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  updateStock,
  searchProducts
} from '../controllers/product.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as RequestHandler);

// Product routes with specific permissions
router.get('/', checkModuleAccess(['inventory', 'products.view']) as RequestHandler, getAllProducts as RequestHandler);
router.get('/search', checkModuleAccess(['inventory', 'products.search']) as RequestHandler, searchProducts as RequestHandler);

// Inventory management routes (require inventory access)
router.use(checkModuleAccess('inventory') as RequestHandler);
router.post('/', createProduct as RequestHandler);
router.get('/low-stock', getLowStockProducts as RequestHandler);
router.get('/:id', getProduct as RequestHandler);
router.put('/:id', updateProduct as RequestHandler);
router.delete('/:id', deleteProduct as RequestHandler);
router.patch('/:id/stock', updateStock as RequestHandler);

export default router; 