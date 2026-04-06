import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import UserLayout from "../layouts/UserLayout";
import ShopAdminLayout from "../layouts/ShopAdminLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

// Public Pages
import Home from "../pages/public/Home";
import Features from "../components/home/Features";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/home/Testimonials";

// Auth Pages
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import ForgotPassword from "../components/auth/ForgotPassword";
import ResetPassword from "../components/auth/ResetPassword";
import OTPVerification from "../components/auth/OTPVerification";

// Dashboard Pages
import UserDashboard from "../pages/user/UserDashboard";
import ShopDetails from "../pages/user/ShopDetails";
import UserOrders from "../pages/user/UserOrders";
import CartPage from "../pages/user/CartPage";
import ShopDashboard from "../pages/shop-admin/ShopDashboard";
import ShopProfile from "../pages/shop-admin/ShopProfile";
import PrintServices from "../pages/shop-admin/PrintServices";
import ShopOrders from "../pages/shop-admin/ShopOrders";
import AdminDashboard from "../pages/super-admin/AdminDashboard";

// NotFound
import NotFound from "../pages/NotFound";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = getUserRole();
    console.log(userRole);
    const hasAccess = allowedRoles.some(role => {
      if (role === "super_admin") return userRole === "super_admin";
      if (role === "shop_admin") return userRole === "shop_admin" || userRole === "super_admin";
      if (role === "user") return ["user", "shop_admin", "super_admin"].includes(userRole);
      return false;
    });

    if (!hasAccess) {
      if (userRole === "super_admin") return <Navigate to="/super-admin/dashboard" replace />;
      if (userRole === "shop_admin") return <Navigate to="/shop-admin/dashboard" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

const routes = [
  // Public Routes
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "features", element: <Features /> },
      { path: "how-it-works", element: <HowItWorks /> },
      { path: "testimonials", element: <Testimonials /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "verify-otp", element: <OTPVerification /> },
    ],
  },

  // User Routes (Regular Users - role: USER)
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["user"]}>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <UserDashboard /> },
      { path: "dashboard/shop/:id", element: <ShopDetails /> },
      { path: "my-orders", element: <UserOrders /> },
      { path: "cart", element: <CartPage /> },
    ],
  },

  // Shop Admin Routes (role: SHOP_ADMIN)
  {
    path: "/shop-admin",
    element: (
      <ProtectedRoute allowedRoles={["shop_admin"]}>
        <ShopAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <ShopDashboard /> },
      { path: "profile", element: <ShopProfile /> },
      { path: "services", element: <PrintServices /> },
      { path: "orders", element: <ShopOrders /> },
    ],
  },

  // Super Admin Routes (role: SUPER_ADMIN)
  {
    path: "/super-admin",
    element: (
      <ProtectedRoute allowedRoles={["super_admin"]}>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
    ],
  },

  // 404 Not Found
  { path: "*", element: <NotFound /> },
];

export default routes;