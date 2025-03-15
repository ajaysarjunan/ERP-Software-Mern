import { Request, Response } from 'express';
import { CustomerModel } from '../models/Customer';
import { CreateCustomerInput, UpdateCustomerInput } from '../types/models.types';

// Create a new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData: CreateCustomerInput = req.body;

    // Validate email uniqueness
    const existingCustomer = await CustomerModel.findOne({ email: customerData.email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }

    const customer = new CustomerModel(customerData);
    await customer.save();

    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

// Get all customers
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await CustomerModel.find({ isActive: true });
    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

// Get a single customer
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await CustomerModel.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

// Update a customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const updateData: UpdateCustomerInput = req.body;
    
    // If email is being updated, check for uniqueness
    if (updateData.email) {
      const existingCustomer = await CustomerModel.findOne({ 
        email: updateData.email,
        _id: { $ne: req.params.id }
      });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const customer = await CustomerModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Error updating customer' });
  }
};

// Delete a customer (soft delete)
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await CustomerModel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
};

// Update loyalty points
export const updateLoyaltyPoints = async (req: Request, res: Response) => {
  try {
    const { points } = req.body;
    
    if (typeof points !== 'number') {
      return res.status(400).json({ message: 'Invalid points value' });
    }

    const customer = await CustomerModel.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const newPoints = customer.loyaltyPoints + points;
    if (newPoints < 0) {
      return res.status(400).json({ message: 'Insufficient loyalty points' });
    }

    customer.loyaltyPoints = newPoints;
    await customer.save();

    res.json({
      message: 'Loyalty points updated successfully',
      customer
    });
  } catch (error) {
    console.error('Update loyalty points error:', error);
    res.status(500).json({ message: 'Error updating loyalty points' });
  }
};

// Search customers
export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const customers = await CustomerModel.find({
      isActive: true,
      $or: [
        { firstName: new RegExp(query as string, 'i') },
        { lastName: new RegExp(query as string, 'i') },
        { email: new RegExp(query as string, 'i') },
        { phone: new RegExp(query as string, 'i') }
      ]
    });

    res.json(customers);
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({ message: 'Error searching customers' });
  }
}; 