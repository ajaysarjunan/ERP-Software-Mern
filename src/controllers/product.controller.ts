import { Request, Response } from 'express';
import { ProductModel, FootwearCategory, Gender } from '../models/Product';

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;

    const product = new ProductModel(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.find({ isActive: true });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get a single product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete a product (soft delete)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Get low stock products
export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.find({
      isActive: true,
      totalStock: { $lte: '$minStockLevel' }
    });

    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Error fetching low stock products' });
  }
};

// Update stock quantity for a specific size
export const updateStock = async (req: Request, res: Response) => {
  try {
    const { size, quantity } = req.body;
    
    if (!size || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Invalid size or quantity value' });
    }

    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const sizeIndex = product.sizes.findIndex(s => s.size === size);
    if (sizeIndex === -1) {
      return res.status(400).json({ message: 'Size not found for this product' });
    }

    const newQuantity = product.sizes[sizeIndex].quantity + quantity;
    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Insufficient stock for this size' });
    }

    product.sizes[sizeIndex].quantity = newQuantity;
    await product.save(); // This will trigger the totalStock calculation

    res.json({
      message: 'Stock updated successfully',
      product
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
};

// Search products
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query, category, gender, brand, minPrice, maxPrice } = req.query;
    
    const searchQuery: any = { isActive: true };
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) searchQuery.category = category;
    if (gender) searchQuery.gender = gender;
    if (brand) searchQuery.brand = brand;
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
    }

    const products = await ProductModel.find(searchQuery);
    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
}; 