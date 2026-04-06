import React from "react";
import { Search, MapPin, ShoppingCart, Package, CreditCard, Headphones } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find Nearby Shops",
    description: "Discover the best print shops in your area with real-time location tracking",
  },
  {
    icon: MapPin,
    title: "Real-time Tracking",
    description: "Track your order from printing to delivery with live updates",
  },
  {
    icon: ShoppingCart,
    title: "Easy Ordering",
    description: "Upload your files, choose specifications, and place your order in minutes",
  },
  {
    icon: Package,
    title: "Various Services",
    description: "From business cards to books, binding to banners - all printing services available",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Multiple payment options with secure transaction processing",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated customer support for all your printing needs",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for your printing needs, all in one platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;