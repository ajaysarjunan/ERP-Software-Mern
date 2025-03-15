// Product Types
export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  gender: string;
  brand: string;
  color: string;
  sizes: Array<{
    size: string;
    quantity: number;
  }>;
  minStockLevel?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  gender?: string;
  brand?: string;
  color?: string;
  minStockLevel?: number;
  isActive?: boolean;
}

// Customer Types
export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  loyaltyPoints?: number;
  isActive?: boolean;
}

// Sale Types
export interface SaleItemInput {
  productId: string;
  size: string;
  quantity: number;
}

export interface CreateSaleInput {
  customerId: string;
  items: SaleItemInput[];
  paymentMethod: 'CASH' | 'CARD' | 'OTHER';
}

// Report Types
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  averageTransactionValue: number;
  itemsSold: number;
  topProducts: Array<{
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
  salesByPaymentMethod: {
    CASH: number;
    CARD: number;
    OTHER: number;
  };
}

export interface InventoryReport {
  totalItems: number;
  totalValue: number;
  lowStockItems: Array<{
    productId: string;
    name: string;
    brand: string;
    category: string;
    sizes: Array<{
      size: string;
      quantity: number;
      isLowStock: boolean;
    }>;
    minStockLevel: number;
  }>;
  outOfStockItems: Array<{
    productId: string;
    name: string;
    brand: string;
    category: string;
    sizes: Array<{
      size: string;
      quantity: number;
    }>;
  }>;
} 