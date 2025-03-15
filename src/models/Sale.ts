import mongoose, { Document, Schema } from 'mongoose';

export interface ISaleItem {
  product: mongoose.Types.ObjectId;
  size: string;
  quantity: number;
  priceAtSale: number;
  subtotal: number;
}

export interface ISale extends Document {
  customer: mongoose.Types.ObjectId;
  items: ISaleItem[];
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'OTHER';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  loyaltyPointsEarned: number;
  processedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtSale: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const saleSchema = new Schema<ISale>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [saleItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CARD', 'OTHER'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
saleSchema.index({ customer: 1 });
saleSchema.index({ processedBy: 1 });
saleSchema.index({ createdAt: 1 });
saleSchema.index({ paymentStatus: 1 });

// Virtual for getting the number of items
saleSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

export const SaleModel = mongoose.model<ISale>('Sale', saleSchema); 