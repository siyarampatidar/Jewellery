import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Pages
import Home from '../pages/Home';
import Collection from '../pages/Collection';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Account from '../pages/Account';
import Register from '../pages/Register';
import VerifyOtp from '../pages/VerifyOtp';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
// import Profile from '../pages/Profile';
import Checkout from '../pages/Checkout';
import AdminConsole from '../pages/admin/AdminConsole';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // If logged in as administrator and trying to view public customer routes, auto-redirect to admin console
  if (isAuthenticated && user?.role === 'admin' && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Routes>
      {/* Root Route Handlers - Redirect to Home Shopping */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Luxury E-commerce Pages */}
      <Route path="/home" element={<Home />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      {/* <Route path="/account" element={<Account />} /> */}

      {/* Guest Authentication Routes */}
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/account" replace /> : <Register />
        }
      />
      
      <Route
        path="/verify-otp"
        element={
          isAuthenticated ? <Navigate to="/account" replace /> : <VerifyOtp />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/account" replace /> : <Login />
        }
      />

      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? <Navigate to="/account" replace /> : <ForgotPassword />
        }
      />

      <Route
        path="/reset-password/:token"
        element={
          isAuthenticated ? <Navigate to="/account" replace /> : <ResetPassword />
        }
      />

      {/* Protected Profile/Dashboard Route (Fallback support) */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      {/* Protected Checkout Route */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Route */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminConsole />
          </AdminRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
