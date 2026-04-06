import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Upload, Printer, Truck } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Find Nearby Print Shops",
    description: "Search for print shops in your area and compare services",
  },
  {
    icon: Upload,
    title: "Upload Your Files",
    description: "Upload your documents, set preferences, and get instant quotes",
  },
  {
    icon: Printer,
    title: "Shop Prints Your Order",
    description: "Selected print shop processes your order with quality materials",
  },
  {
    icon: Truck,
    title: "Quick Delivery",
    description: "Get your prints delivered to your doorstep in record time",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get your printing done in 4 simple steps</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">For Print Shop Owners</h3>
              <p className="text-gray-700">Register your shop and reach more customers in your area</p>
            </div>
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-orange-600 rounded-full font-semibold hover:shadow-lg transition-all border-2 border-orange-500"
            >
              Register Your Shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;