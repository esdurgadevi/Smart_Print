import React from "react";
import { Link } from "react-router-dom";
import { Printer, Truck, Clock, Shield } from "lucide-react";

const Hero = () => {
  const printShopImages = [
    "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3844591/pexels-photo-3844591.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/263401/pexels-photo-263401.jpeg?auto=compress&cs=tinysrgb&w=800",
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Nearby Print Shop
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                {" "}Just a Click Away
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find local print shops, get instant quotes, and get your printing done - from
              business cards to books, delivered to your doorstep in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 text-center"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-orange-500 text-orange-600 rounded-full text-lg font-semibold hover:bg-orange-50 transition-all text-center"
              >
                Login
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mt-12">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-600">Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-600">24/7 Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <Printer className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-600">Quality Prints</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={printShopImages[0]}
                alt="Print Shop"
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-red-600/20"></div>
            </div>
            <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3 animate-bounce">
              <Printer className="h-8 w-8 text-orange-500" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-pulse">
              <Truck className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Wave Background */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;