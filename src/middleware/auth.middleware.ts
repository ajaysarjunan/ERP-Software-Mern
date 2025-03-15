import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { ROLE_PERMISSIONS, UserRole } from '../types/auth.types';
import { Document } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface UserDocument extends Document {
  _id: string;
  role: UserRole;
  firstName: string;
  isActive: boolean;
}

// Add user property to Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        firstName: string;
      };
    }
  }
}

// Middleware to verify JWT token
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await UserModel.findById(decoded.userId) as UserDocument | null;

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    // Add minimal user info to request
    (req as any).user = {
      userId: user._id,
      role: user.role,
      firstName: user.firstName
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check module access based on role
export const checkModuleAccess = (requiredModule: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role as UserRole;
    
    if (!userRole) {
      return res.status(401).json({ message: 'User role not found' });
    }

    const allowedModules = ROLE_PERMISSIONS[userRole] || [];
    const requiredModules = Array.isArray(requiredModule) ? requiredModule : [requiredModule];

    // Check if user has access to any of the required modules
    const hasAccess = requiredModules.some(module => 
      allowedModules.includes(module) || 
      allowedModules.some((permission: string) => permission.startsWith(module + '.'))
    );

    if (!hasAccess) {
      return res.status(403).json({ 
        message: `Access denied: You don't have permission to access ${requiredModules.join(' or ')}`
      });
    }

    next();
  };
}; 