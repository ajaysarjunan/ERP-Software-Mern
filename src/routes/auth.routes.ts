import { Router, Request, Response, NextFunction } from 'express';
import { login, register, getAllUsers, deleteUser } from '../controllers/auth.controller';
import { authenticateToken, checkModuleAccess } from '../middleware/auth.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();

// Public routes
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await register(req, res);
  } catch (error) {
    next(error);
  }
});

// Protected routes - Only SUPER_ADMIN can access
router.get(
  '/users',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authenticateToken(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await checkModuleAccess(['permissions'])(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAllUsers(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/users/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authenticateToken(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await checkModuleAccess(['permissions'])(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router; 