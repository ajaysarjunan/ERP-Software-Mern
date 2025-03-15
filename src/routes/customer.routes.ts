import { Router, RequestHandler } from 'express';
import { authenticateToken, checkModuleAccess } from '../middleware/auth.middleware';
import {
  createCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  updateLoyaltyPoints,
  searchCustomers
} from '../controllers/customer.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as RequestHandler);

// Routes with granular permissions
router.post('/', checkModuleAccess(['customer', 'customer.create']) as RequestHandler, createCustomer as RequestHandler);
router.get('/search', checkModuleAccess(['customer', 'customer.search']) as RequestHandler, searchCustomers as RequestHandler);

// Routes that require full customer module access
router.get('/', checkModuleAccess('customer') as RequestHandler, getAllCustomers as RequestHandler);
router.get('/:id', checkModuleAccess('customer') as RequestHandler, getCustomer as RequestHandler);
router.put('/:id', checkModuleAccess('customer') as RequestHandler, updateCustomer as RequestHandler);
router.delete('/:id', checkModuleAccess('customer') as RequestHandler, deleteCustomer as RequestHandler);
router.patch('/:id/loyalty-points', checkModuleAccess('customer') as RequestHandler, updateLoyaltyPoints as RequestHandler);

export default router; 