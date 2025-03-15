export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER'
}

export interface User {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define module access for each role
export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: [
    'sales',
    'inventory',
    'customer',
    'analytics',
    'company',
    'permissions'
  ],
  [UserRole.ADMIN]: [
    'sales',
    'inventory',
    'customer',
    'analytics'
  ],
  [UserRole.MANAGER]: [
    'sales',
    'inventory',
    'customer'
  ],
  [UserRole.CASHIER]: [
    'sales',
    'customer.create',
    'customer.search',
    'products.view',
    'products.search'
  ]
}; 