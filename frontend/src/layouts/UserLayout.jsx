import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Home, Store, ShoppingBag, User, LogOut, ShoppingCart } from "lucide-react";

const UserLayout = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const userNavItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/explore-shops", icon: Store, label: "Explore Shops" },
    { to: "/cart", icon: ShoppingCart, label: "Cart", badge: cartItems.length },
    { to: "/my-orders", icon: ShoppingBag, label: "My Orders" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const adminNavItems = [
    { to: "/shop-admin/dashboard", icon: Home, label: "Dashboard" },
    { to: "/shop-admin/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/shop-admin/services", icon: Store, label: "Services" },
    { to: "/shop-admin/profile", icon: User, label: "Profile" },
  ];

  const navItems = user?.role === "shop_admin" ? adminNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                PrintHub
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors relative ${
                    location.pathname === item.to
                      ? "text-orange-600 bg-orange-50 font-semibold"
                      : "text-gray-600 hover:text-orange-600 hover:bg-gray-50 bg-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hi, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;