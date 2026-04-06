import React from "react";
import { Link } from "react-router-dom";
import { Printer } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="text-center">
        <Printer className="h-24 w-24 text-orange-500 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
        <Link
          to="/"
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;