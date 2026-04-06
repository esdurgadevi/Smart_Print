import React, { useState } from "react";
import { X, CreditCard, Lock, CheckCircle2 } from "lucide-react";

const PaymentModal = ({ isOpen, onClose, totalAmount, onPaymentSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dummy state just for realistic UI feels
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (!isOpen) return null;

  const handlePay = () => {
    // Basic validation
    if (card.length < 16 || expiry.length < 5 || cvv.length < 3) {
      alert("Please enter full dummy payment details to proceed");
      return;
    }

    setProcessing(true);
    // Simulate 2s network/bank request delay
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
         onPaymentSuccess();
      }, 1000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl auto max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 relative z-10">
          <div>
             <h3 className="text-xl font-extrabold text-gray-900 leading-tight">Secure Checkout</h3>
             <span className="text-xs text-gray-500 font-medium">Dummy Sandbox Gateway</span>
          </div>
          {!processing && !success && (
            <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-black">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 pb-8 relative">
          {success ? (
             <div className="text-center py-8">
               <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h3>
               <p className="text-gray-500 text-sm">₹{totalAmount.toFixed(2)} captured.</p>
             </div>
          ) : processing ? (
             <div className="text-center py-12 flex flex-col items-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-6 font-bold"></div>
               <h3 className="text-lg font-bold text-gray-900 mb-2 mt-4">Processing with Bank...</h3>
               <p className="text-gray-500 text-sm">Please do not refresh the page.</p>
             </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                 <Lock className="text-blue-500 h-6 w-6" />
                 <div>
                   <span className="block text-xs text-blue-600 font-bold uppercase tracking-wider">Amount to Pay</span>
                   <span className="block text-2xl font-extrabold text-blue-900">₹{totalAmount.toFixed(2)}</span>
                 </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input 
                    type="text" 
                    placeholder="4111 2222 3333 4444" 
                    maxLength="16"
                    value={card}
                    onChange={(e) => setCard(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium tracking-widest text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Expiry</label>
                   <input 
                     type="text" 
                     placeholder="MM/YY" 
                     maxLength="5"
                     value={expiry}
                     onChange={(e) => setExpiry(e.target.value)}
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">CVV</label>
                   <input 
                     type="password" 
                     placeholder="•••" 
                     maxLength="3"
                     value={cvv}
                     onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center tracking-widest font-bold focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                   />
                </div>
              </div>

              <button 
                onClick={handlePay}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                Pay ₹{totalAmount.toFixed(2)} securely
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
