import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Trash2, ShoppingCart, ArrowLeft, ShieldCheck } from "lucide-react";
import PaymentModal from "../../components/user/PaymentModal";
import { placeBatchOrder } from "../../services/orderService";

const CartPage = () => {
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      await placeBatchOrder(cartItems);
      clearCart();
      setIsPaymentOpen(false);
      navigate("/my-orders");
    } catch (error) {
      alert("Failed to confirm order post-payment.");
      setIsPaymentOpen(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-16 shadow-sm border border-gray-100">
          <ShoppingCart className="h-20 w-20 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Looks like you haven't added any print services yet.
          </p>
          <button 
            onClick={() => navigate('/explore-shops')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-95"
          >
            Explore Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:scale-105 transition-transform text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Secure Cart <ShieldCheck className="h-6 w-6 text-green-500" />
          </h1>
          <p className="text-gray-500">Review your configurations before payment.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, idx) => (
            <div key={item.id || idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.service?.serviceName || "Print Service"}</h3>
                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  <p><strong>Configured Pages:</strong> {item.pageRange && item.pageRange !== "" && item.pageRange.toLowerCase() !== "all" ? item.pageRange : "Full Document"} (Detected {item.pageCount} total)</p>
                  <p><strong>Copies Requested:</strong> {item.copies}</p>
                </div>
              </div>
              <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 border-gray-100">
                 <span className="font-extrabold text-xl text-gray-900">₹{Number(item.totalAmount).toFixed(2)}</span>
                 <button 
                   onClick={() => removeFromCart(item.id)} 
                   className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                 >
                   <Trash2 className="h-4 w-4" /> Remove
                 </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 text-lg mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-medium text-gray-900">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-8">
               <div className="flex justify-between items-center bg-orange-50 rounded-xl p-4 border border-orange-100">
                 <span className="font-bold text-orange-900">Total Amount</span>
                 <span className="text-3xl font-black text-orange-600">₹{cartTotal.toFixed(2)}</span>
               </div>
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl py-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
            >
              Proceed to Payment
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1">
               <ShieldCheck className="h-3 w-3" /> Encrypted Sandbox Connection
            </p>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={cartTotal}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CartPage;
