import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import SalesHistory from './pages/SalesHistory';
import Users from './pages/Users';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types/auth.types';

// Protected route component wrapper
const ProtectedRoute: React.FC<{ 
  element: React.ReactElement; 
  allowedRoles?: UserRole[];
}> = ({ element, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" />;
  }

  return element;
};

const AppRoutes: React.FC = () => {
  const commonRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER];

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute element={<Dashboard />} />} 
      />
      <Route 
        path="/sales/new" 
        element={<ProtectedRoute element={<Sales />} />} 
      />
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute 
            element={<Inventory />} 
            allowedRoles={commonRoles}
          />
        } 
      />
      <Route 
        path="/customers" 
        element={
          <ProtectedRoute 
            element={<Customers />} 
            allowedRoles={commonRoles}
          />
        } 
      />
      <Route 
        path="/sales/history" 
        element={
          <ProtectedRoute 
            element={<SalesHistory />} 
            allowedRoles={commonRoles}
          />
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute 
            element={<Users />} 
            allowedRoles={[UserRole.SUPER_ADMIN]}
          />
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
