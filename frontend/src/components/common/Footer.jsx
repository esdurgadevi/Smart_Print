import React from "react";
import { Link } from "react-router-dom";
import { Printer, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Printer className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold">PrintHub</span>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting customers with the best print shops in their neighborhood for quick,
              quality printing services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-orange-500 transition-colors">
                <span className="text-xl">📘</span>
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <span className="text-xl">🐦</span>
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <span className="text-xl">📷</span>
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <span className="text-xl">🔗</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-orange-500 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  For Shop Owners
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Printing Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Business Cards</li>
              <li className="text-gray-400">Book Binding</li>
              <li className="text-gray-400">Flyers & Brochures</li>
              <li className="text-gray-400">Posters & Banners</li>
              <li className="text-gray-400">Document Printing</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <span className="text-gray-400">support@printhub.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500" />
                <span className="text-gray-400">+91 1234567890</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-orange-500" />
                <span className="text-gray-400">Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} PrintHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;