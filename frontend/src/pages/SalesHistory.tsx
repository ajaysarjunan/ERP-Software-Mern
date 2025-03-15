import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SaleItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface Sale {
  _id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchSales();
  }, [dateFilter]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:3000/api/sales';
      
      if (dateFilter === 'custom' && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      } else if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        url += `?startDate=${today}&endDate=${today}`;
      } else if (dateFilter === 'week') {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        url += `?startDate=${weekAgo.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`;
      }

      const response = await axios.get(url, { headers });
      setSales(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching sales');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.totalAmount, 0);
  };

  const calculateTotalItems = () => {
    return sales.reduce((total, sale) => 
      total + sale.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0), 0
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales History</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-2xl">{sales.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-2xl">${calculateTotalRevenue().toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Items Sold</h3>
          <p className="text-2xl">{calculateTotalItems()}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="custom">Custom Range</option>
        </select>

        {dateFilter === 'custom' && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded"
            />
            <button
              onClick={fetchSales}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Apply Filter
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">Date</th>
                <th className="py-2 px-4 border text-left">Customer</th>
                <th className="py-2 px-4 border text-left">Items</th>
                <th className="py-2 px-4 border text-right">Total Amount</th>
                <th className="py-2 px-4 border text-left">Payment Method</th>
                <th className="py-2 px-4 border text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">
                    {new Date(sale.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border">
                    {sale.customer.firstName} {sale.customer.lastName}
                  </td>
                  <td className="py-2 px-4 border">
                    {sale.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.name} - {item.size} (x{item.quantity})
                      </div>
                    ))}
                  </td>
                  <td className="py-2 px-4 border text-right">
                    ${sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border">{sale.paymentMethod}</td>
                  <td className="py-2 px-4 border">
                    <span className={`px-2 py-1 rounded text-sm ${
                      sale.paymentStatus === 'PAID' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.paymentStatus}
                    </span>
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

export default SalesHistory; 