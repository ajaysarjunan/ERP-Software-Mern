import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl mb-4">Welcome, {user?.firstName}!</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Common Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleNavigation('/sales/new')}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              New Sale
            </button>

            {/* Show these buttons only for SUPER_ADMIN, ADMIN, and MANAGER */}
            {user?.role && [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER].includes(user.role) && (
              <>
                <button
                  onClick={() => handleNavigation('/inventory')}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Manage Inventory
                </button>
                <button
                  onClick={() => handleNavigation('/customers')}
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                  Manage Customers
                </button>
                <button
                  onClick={() => handleNavigation('/sales/history')}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  View Sales History
                </button>
              </>
            )}

            {/* Additional buttons for SUPER_ADMIN only */}
            {user?.role === UserRole.SUPER_ADMIN && (
              <button
                onClick={() => handleNavigation('/users')}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Manage Users
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 