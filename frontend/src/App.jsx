import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { checkCurrentUser } from "./redux/authSlice";
import { fetchCart } from "./redux/cartSlice";
import { fetchWishlist } from "./redux/wishlistSlice";
import Navbar from "./components/Navbar";
import BottomNavigation from "./components/BottomNavigation";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Pages where Navbar & BottomNavigation should be hidden
  const isAdminPath = location.pathname.startsWith("/admin");
  const isAuthPath = [
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
  ].includes(location.pathname) || location.pathname.startsWith('/reset-password');
  const hideNavigation = isAdminPath || isAuthPath;

  // Restore session when user opens / refreshes the app
  useEffect(() => {
    dispatch(checkCurrentUser());
  }, [dispatch]);

  // When auth state resolves, fetch user-specific cart & wishlist from DB
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans relative">
      {/* Dynamic responsive navigation - hidden for admin & auth pages */}
      {!hideNavigation && <Navbar />}

      {/* Primary Routes viewports */}
      <main className="flex-1 flex flex-col">
        <AppRoutes />
      </main>

      {/* Floating Bottom Nav for mobile/tablet - hidden for admin & auth pages */}
      {!hideNavigation && <BottomNavigation />}

      {/* Global premium notifications toaster config */}
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "luxury-glass font-semibold text-sm border border-zinc-100 shadow-xl rounded-xl p-4 text-zinc-900",
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#111111",
          },
          success: {
            iconTheme: {
              primary: "#eab308", // Gold
              secondary: "#ffffff",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
