import mongoose, { Document, Schema } from 'mongoose';

// Define footwear categories
export enum FootwearCategory {
  CASUAL_SHOES = 'CASUAL_SHOES',
  SANDALS = 'SANDALS',
  SLIPPERS = 'SLIPPERS',
  SPORTS_SHOES = 'SPORTS_SHOES',
  FORMAL_SHOES = 'FORMAL_SHOES',
  CLOGS = 'CLOGS',
  BEACHWEAR = 'BEACHWEAR'
}

// Define available sizes (you can adjust the range as needed)
export const SIZES = [
  '6', '7', '8', '9', '10', '11', '12'
];

// Define gender options
export enum Gender {
  MENS = 'MENS',
  WOMENS = 'WOMENS',
  UNISEX = 'UNISEX',
  KIDS = 'KIDS'
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: FootwearCategory;
  gender: Gender;
  brand: string;
  sizes: {
    size: string;
    quantity: number;
  }[];
  color: string;
  productId: string;
  minStockLevel: number;
  isActive: boolean;
  totalStock: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: Object.values(FootwearCategory),
    required: true,
    index: true
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: true,
    index: true
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  sizes: [{
    size: {
      type: String,
      enum: SIZES,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  color: {
    type: String,
    required: true,
    trim: true
  },
  productId: {
    type: String,
    unique: true,
    index: true
  },
  minStockLevel: {
    type: Number,
    required: true,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalStock: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total stock before saving
productSchema.pre('save', function(next) {
  this.totalStock = this.sizes.reduce((total, size) => total + size.quantity, 0);
  next();
});

// Function to generate product ID
async function generateProductId(category: FootwearCategory): Promise<string> {
  const prefix = category.substring(0, 3).toUpperCase();
  
  // Find the highest number for this category
  const highestProduct = await ProductModel.findOne({ 
    productId: new RegExp(`^${prefix}-\\d+$`) 
  }).sort({ productId: -1 });

  let number = 1;
  if (highestProduct && highestProduct.productId) {
    const currentNumber = parseInt(highestProduct.productId.split('-')[1]);
    number = currentNumber + 1;
  }

  // Pad the number with zeros
  const paddedNumber = number.toString().padStart(4, '0');
  return `${prefix}-${paddedNumber}`;
}

// Pre-save middleware to generate productId
productSchema.pre('save', async function(next) {
  if (!this.productId) {
    try {
      this.productId = await generateProductId(this.category);
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const ProductModel = mongoose.model<IProduct>('Product', productSchema); 