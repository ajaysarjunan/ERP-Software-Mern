import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  brand: string;
  sizes: Array<{
    size: string;
    quantity: number;
  }>;
}

interface CartItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

const Sales: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get token from localStorage
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Search customers
  const searchCustomers = async (query: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/customers/search?query=${query}`, { headers });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error searching customers:', error);
      setError('Error searching customers');
    }
  };

  // Search products
  const searchProducts = async (query: string) => {
    try {
      setError('');
      const response = await axios.get(`http://localhost:3000/api/products/search?query=${encodeURIComponent(query)}`, { headers });
      if (response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Error searching products:', error);
      setError(error.response?.data?.message || 'Error searching products');
      setProducts([]);
    }
  };

  // Add item to cart
  const addToCart = (product: Product, size: string, quantity: number) => {
    const existingItem = cart.find(item => item.productId === product._id && item.size === size);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product._id && item.size === size
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        size,
        quantity,
        price: product.price
      }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (productId: string, size: string) => {
    setCart(cart.filter(item => !(item.productId === productId && item.size === size)));
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Process sale
  const processSale = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customerId: selectedCustomer._id,
        items: cart.map(item => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity
        })),
        paymentMethod: 'CASH' // You can add payment method selection UI if needed
      };

      await axios.post('http://localhost:3000/api/sales', saleData, { headers });
      
      // Clear cart and selected customer after successful sale
      setCart([]);
      setSelectedCustomer(null);
      setError('');
      alert('Sale completed successfully!');
    } catch (error: any) {
      console.error('Error processing sale:', error);
      setError(error.response?.data?.message || 'Error processing sale');
    } finally {
      setLoading(false);
    }
  };

  // Effect for customer search
  useEffect(() => {
    if (customerSearch) {
      const delayDebounceFn = setTimeout(() => {
        searchCustomers(customerSearch);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [customerSearch]);

  // Effect for product search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (productSearch.trim()) {
        searchProducts(productSearch);
      } else {
        // Clear products when search is empty
        setProducts([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [productSearch]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">New Sale</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Customer Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Customer</h2>
        {selectedCustomer ? (
          <div className="bg-gray-100 p-4 rounded">
            <p>{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
            <p>Loyalty Points: {selectedCustomer.loyaltyPoints}</p>
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="text-red-600 text-sm mt-2"
            >
              Change Customer
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <div className="max-h-40 overflow-y-auto">
              {customers.map(customer => (
                <div
                  key={customer._id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {customer.firstName} {customer.lastName} - {customer.phone}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Products</h2>
        <input
          type="text"
          placeholder="Search products by name, brand, or description..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productSearch.trim() ? (
            products.length > 0 ? (
              products.map(product => (
                <div key={product._id} className="border p-4 rounded">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p>Price: ${product.price}</p>
                  <div className="mt-2">
                    {product.sizes.map(size => (
                      <button
                        key={size.size}
                        onClick={() => addToCart(product, size.size, 1)}
                        disabled={size.quantity === 0}
                        className={`mr-2 mb-2 px-3 py-1 rounded ${
                          size.quantity > 0 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-300'
                        }`}
                      >
                        {size.size} ({size.quantity})
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No products found matching your search
              </div>
            )
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Type in the search box to find products
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">No items in cart</p>
        ) : (
          <div>
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm">Size: {item.size} | Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center">
                  <p className="mr-4">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4 text-right">
              <p className="text-xl font-bold">Total: ${calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Process Sale Button */}
      <button
        onClick={processSale}
        disabled={loading || cart.length === 0 || !selectedCustomer}
        className={`w-full py-3 rounded ${
          loading || cart.length === 0 || !selectedCustomer
            ? 'bg-gray-300'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {loading ? 'Processing...' : 'Complete Sale'}
      </button>
    </div>
  );
};

export default Sales; 