import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  category: string;
  sizes: Array<{
    size: string;
    quantity: number;
  }>;
}

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/products', { headers });
      setProducts(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/products/search?query=${encodeURIComponent(searchQuery)}`,
        { headers }
      );
      setProducts(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error searching products');
    } finally {
      setLoading(false);
    }
  };

  const getTotalStock = (sizes: Array<{ size: string; quantity: number }>) => {
    return sizes.reduce((total, size) => total + size.quantity, 0);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  const categories = ['all', ...new Set(products.map(product => product.category))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full p-2 border rounded"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">Name</th>
                <th className="py-2 px-4 border text-left">Brand</th>
                <th className="py-2 px-4 border text-left">Category</th>
                <th className="py-2 px-4 border text-right">Price</th>
                <th className="py-2 px-4 border text-right">Total Stock</th>
                <th className="py-2 px-4 border text-left">Sizes Available</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{product.name}</td>
                  <td className="py-2 px-4 border">{product.brand}</td>
                  <td className="py-2 px-4 border">{product.category}</td>
                  <td className="py-2 px-4 border text-right">${product.price.toFixed(2)}</td>
                  <td className="py-2 px-4 border text-right">{getTotalStock(product.sizes)}</td>
                  <td className="py-2 px-4 border">
                    {product.sizes.map(size => (
                      <span key={size.size} className="inline-block bg-gray-200 rounded px-2 py-1 text-sm mr-2 mb-1">
                        {size.size}: {size.quantity}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inventory; 