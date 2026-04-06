import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X, Printer, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDashboardClick = () => {
    const role = user?.role?.toLowerCase();
    console.log(role);
    if (role === "super_admin") {
      navigate("/super-admin/dashboard");
    } else if (role === "shop_admin") {
      navigate("/shop-admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-md z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Printer className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              PrintHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-gray-700 hover:text-orange-500 transition-colors">
              Features
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-orange-500 transition-colors">
              How It Works
            </Link>
            <Link to="/testimonials" className="text-gray-700 hover:text-orange-500 transition-colors">
              Testimonials
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hi, {user.name}</span>
                <button
                  onClick={handleDashboardClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:shadow-lg transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link to="/features" className="text-gray-700 hover:text-orange-500">
                Features
              </Link>
              <Link to="/how-it-works" className="text-gray-700 hover:text-orange-500">
                How It Works
              </Link>
              <Link to="/testimonials" className="text-gray-700 hover:text-orange-500">
                Testimonials
              </Link>
              {user ? (
                <>
                  <span className="text-gray-700">Hi, {user.name}</span>
                  <button onClick={handleDashboardClick} className="text-left text-orange-600">
                    Dashboard
                  </button>
                  <button onClick={logout} className="text-left text-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-left text-gray-700">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;