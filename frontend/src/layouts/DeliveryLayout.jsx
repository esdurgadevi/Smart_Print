import React from "react";
import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { LogOut, Home, Navigation } from "lucide-react";
import authService from "../services/authService";
import { getUserData, getUserRole } from "../utils/auth";

const DeliveryLayout = () => {
  const navigate = useNavigate();
  const user = getUserData();
  const role = getUserRole();

  if (role !== "DELIVERY_PERSON" && role !== "delivery_person") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/delivery/dashboard" className="text-xl font-bold text-orange-600">
                  Delivery Partner
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/delivery/dashboard"
                  className="border-orange-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <Home className="h-4 w-4 mr-2" /> Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.name || "Partner"}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          Delivery Partner Portal © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default DeliveryLayout;