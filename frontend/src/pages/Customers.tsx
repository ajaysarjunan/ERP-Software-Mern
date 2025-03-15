import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoBack from '../components/GoBack';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  createdAt: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/customers', { headers });
      setCustomers(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/customers/search?query=${encodeURIComponent(searchQuery)}`,
        { headers }
      );
      setCustomers(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error searching customers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <GoBack />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full p-2 border rounded"
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">Name</th>
                <th className="py-2 px-4 border text-left">Email</th>
                <th className="py-2 px-4 border text-left">Phone</th>
                <th className="py-2 px-4 border text-right">Loyalty Points</th>
                <th className="py-2 px-4 border text-left">Member Since</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td className="py-2 px-4 border">{customer.email}</td>
                  <td className="py-2 px-4 border">{customer.phone}</td>
                  <td className="py-2 px-4 border text-right">{customer.loyaltyPoints}</td>
                  <td className="py-2 px-4 border">
                    {new Date(customer.createdAt).toLocaleDateString()}
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

export default Customers; 