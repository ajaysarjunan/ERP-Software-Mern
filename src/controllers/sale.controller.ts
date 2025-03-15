import { Request, Response } from 'express';
import { SaleModel } from '../models/Sale';
import { ProductModel } from '../models/Product';
import { CustomerModel } from '../models/Customer';
import { CreateSaleInput, DateRange, SalesReport } from '../types/models.types';
import mongoose from 'mongoose';

// Create a new sale
export const createSale = async (req: Request, res: Response) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const saleData: CreateSaleInput = req.body;
    const userId = (req as any).user?.userId;

    console.log('Creating sale with data:', {
      ...saleData,
      userId
    });

    // Validate request body
    if (!saleData.customerId || !saleData.items || !Array.isArray(saleData.items) || saleData.items.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid request body. Required: customerId, items array with at least one item' 
      });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    // Validate customer
    const customer = await CustomerModel.findById(saleData.customerId).session(session);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    console.log('Customer found:', customer._id);

    // Calculate total and validate stock
    let totalAmount = 0;
    const processedItems = [];

    for (const item of saleData.items) {
      console.log('Processing item:', item);
      
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ message: `Invalid product ID format: ${item.productId}` });
      }

      const product = await ProductModel.findById(item.productId).session(session);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      console.log('Product found:', {
        id: product._id,
        name: product.name,
        sizes: product.sizes
      });

      // Find the size in product's sizes array
      const sizeStock = product.sizes.find(s => s.size === item.size);
      if (!sizeStock) {
        return res.status(404).json({ message: `Size ${item.size} not found for product: ${product.name}` });
      }

      console.log('Size stock found:', {
        size: sizeStock.size,
        quantity: sizeStock.quantity
      });

      if (sizeStock.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product.name}, size: ${item.size}`,
          available: sizeStock.quantity,
          requested: item.quantity
        });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      // Update stock for specific size
      const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
      product.sizes[sizeIndex].quantity -= item.quantity;
      await product.save({ session });

      processedItems.push({
        product: product._id,
        size: item.size,
        quantity: item.quantity,
        priceAtSale: product.price,
        subtotal
      });
    }

    // Calculate loyalty points (1 point per $10 spent)
    const loyaltyPointsEarned = Math.floor(totalAmount / 10);

    console.log('Creating sale record:', {
      customerId: customer._id,
      totalAmount,
      itemCount: processedItems.length,
      loyaltyPointsEarned
    });

    // Create sale record
    const sale = new SaleModel({
      customer: customer._id,
      items: processedItems,
      totalAmount,
      paymentMethod: saleData.paymentMethod,
      paymentStatus: 'COMPLETED',
      loyaltyPointsEarned,
      processedBy: userId
    });

    await sale.save({ session });

    // Update customer loyalty points
    customer.loyaltyPoints = (customer.loyaltyPoints || 0) + loyaltyPointsEarned;
    await customer.save({ session });

    await session.commitTransaction();
    console.log('Sale transaction committed successfully');

    res.status(201).json({
      message: 'Sale completed successfully',
      sale,
      loyaltyPointsEarned
    });
  } catch (error) {
    console.error('Create sale error:', error);
    if (session) {
      await session.abortTransaction();
    }
    if (error instanceof Error) {
      res.status(500).json({ 
        message: 'Error processing sale',
        error: error.message,
        stack: error.stack
      });
    } else {
      res.status(500).json({ 
        message: 'Error processing sale',
        error: String(error)
      });
    }
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// Get all sales
export const getAllSales = async (req: Request, res: Response) => {
  try {
    const sales = await SaleModel.find()
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name price')
      .populate('processedBy', 'firstName lastName');
    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Error fetching sales' });
  }
};

// Get a single sale
export const getSale = async (req: Request, res: Response) => {
  try {
    const sale = await SaleModel.findById(req.params.id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name price')
      .populate('processedBy', 'firstName lastName');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ message: 'Error fetching sale' });
  }
};

// Generate sales report
export const generateSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate }: DateRange = req.body;

    const sales = await SaleModel.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('items.product');

    // Calculate report metrics
    const report: SalesReport = {
      totalSales: sales.length,
      totalRevenue: 0,
      averageTransactionValue: 0,
      itemsSold: 0,
      topProducts: [],
      salesByPaymentMethod: {
        CASH: 0,
        CARD: 0,
        OTHER: 0
      }
    };

    // Product sales tracking
    const productSales: { [key: string]: { name: string; quantitySold: number; revenue: number } } = {};

    // Calculate metrics
    sales.forEach(sale => {
      report.totalRevenue += sale.totalAmount;
      report.salesByPaymentMethod[sale.paymentMethod]++;

      sale.items.forEach(item => {
        report.itemsSold += item.quantity;
        const productId = item.product.toString();
        
        if (!productSales[productId]) {
          productSales[productId] = {
            name: (item.product as any).name || 'Unknown Product',
            quantitySold: 0,
            revenue: 0
          };
        }
        
        productSales[productId].quantitySold += item.quantity;
        productSales[productId].revenue += item.subtotal;
      });
    });

    // Calculate average transaction value
    report.averageTransactionValue = report.totalSales > 0 
      ? report.totalRevenue / report.totalSales 
      : 0;

    // Get top products
    report.topProducts = Object.entries(productSales)
      .map(([productId, data]) => ({
        productId,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json(report);
  } catch (error) {
    console.error('Generate sales report error:', error);
    res.status(500).json({ message: 'Error generating sales report' });
  }
}; 