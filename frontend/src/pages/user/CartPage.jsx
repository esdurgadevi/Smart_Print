import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Trash2, ShoppingCart, ArrowLeft, ShieldCheck, Truck, MapPin, Tag, Check, X } from "lucide-react";
import PaymentModal from "../../components/user/PaymentModal";
import { placeBatchOrder } from "../../services/orderService";
import shopService from "../../services/shopService";
import axios from "axios";

// Tiny axios instance for public discount reads (no auth needed — filter on frontend)
const discountApi = axios.create({ baseURL: "http://localhost:5000/api/discounts" });
discountApi.interceptors.request.use(c => {
  const t = localStorage.getItem("accessToken");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

/* ── Discount Toast Popup ─────────────────────────────────────────── */
const DiscountToast = ({ discount, serviceName, onClose }) => (
  <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-4 fade-in duration-500">
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl shadow-green-300 p-5 w-80 relative">
      <button onClick={onClose} className="absolute top-3 right-3 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Tag className="h-5 w-5" />
        </div>
        <div>
          <p className="font-black text-lg leading-none">🎉 Discount Unlocked!</p>
          <p className="text-green-100 text-xs mt-0.5">"{serviceName}"</p>
        </div>
      </div>
      <p className="text-2xl font-black mb-1">
        {Number(discount.discountPercentage).toFixed(0)}% OFF Applied!
      </p>
      <p className="text-green-100 text-xs">
        Because you ordered {discount.minQuantity}+ copies 🖨️
      </p>
      <div className="mt-3 flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-bold">
        <Check className="h-3.5 w-3.5" /> Discount automatically deducted from your total
      </div>
    </div>
  </div>
);

const CartPage = () => {
  const { cartItems, cartTotal, cartShopId, removeFromCart, clearCart } = useCart();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [address, setAddress] = useState(""); // Unified single line address
  const navigate = useNavigate();

  const [shopCoords, setShopCoords] = useState(null);
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Discount state
  const [shopDiscounts, setShopDiscounts] = useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { discount, serviceName }
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef(null);
  const prevAppliedRef = useRef(null);

  // Fetch shop coords
  useEffect(() => {
    if (cartShopId) {
      shopService.getShopDetails(cartShopId).then(async data => {
        if (data.shop) {
          if (data.shop.latitude && data.shop.longitude) {
            setShopCoords({
              lat: parseFloat(data.shop.latitude),
              lng: parseFloat(data.shop.longitude),
            });
          } else {
            // FALLBACK: Geocode the shop's address if lat/lng are missing
            const query = data.shop.fullAddress || `${data.shop.city} ${data.shop.pincode}`;
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
              const results = await res.json();
              if (results && results.length > 0) {
                setShopCoords({
                  lat: parseFloat(results[0].lat),
                  lng: parseFloat(results[0].lon),
                });
              } else {
                // Absolute last resort default (Chennai)
                setShopCoords({ lat: 13.0827, lng: 80.2707 });
              }
            } catch (e) {
              setShopCoords({ lat: 13.0827, lng: 80.2707 });
            }
          }
        }
      }).catch(() => { });
    }
  }, [cartShopId]);

  const deg2rad = deg => deg * (Math.PI / 180);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Debounced geocoding
  useEffect(() => {
    const fullAddress = address.trim();
    if (fullAddress.length < 5 || !shopCoords) return;

    setIsCalculatingDistance(true);
    const timer = setTimeout(async () => {
      try {
        let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
        let data = await res.json();
        
        if (data && data.length) {
          const dist = getDistanceFromLatLonInKm(shopCoords.lat, shopCoords.lng, parseFloat(data[0].lat), parseFloat(data[0].lon));
          setDeliveryDistanceKm(Math.max(0.5, dist));
        } else {
          // Fallback to a random small distance if geocoding totally fails but address is provided
          setDeliveryDistanceKm(2.5);
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      } finally {
        setIsCalculatingDistance(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [address, shopCoords]);


  // ── Price calculations ──
  const deliveryFee = deliveryType === "delivery" && deliveryDistanceKm > 0 ? 20 + Math.floor(deliveryDistanceKm * 5) : 0;
  
  // Calculate savings from items that already had discounts applied in the modal
  const discountSavings = cartItems.reduce((acc, item) => {
    if (item.originalAmount && item.originalAmount > item.totalAmount) {
      return acc + (item.originalAmount - item.totalAmount);
    }
    return acc;
  }, 0);

  const originalSubtotal = cartTotal + discountSavings;
  const finalTotal = cartTotal + deliveryFee;


  const handleCheckoutClick = () => {
    if (deliveryType === "delivery" && address.length < 10) {
      alert("Please provide a more detailed delivery address."); return;
    }
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const splitDeliveryFee = deliveryType === "delivery" && deliveryFee > 0 ? deliveryFee / cartItems.length : 0;
      const discountFactor = appliedDiscount ? (1 - Number(appliedDiscount.discount.discountPercentage) / 100) : 1;

      const itemsWithDelivery = cartItems.map(item => ({
        ...item,
        totalAmount: (Number(item.totalAmount) * discountFactor) + splitDeliveryFee,
        deliveryType,
        deliveryAddress: deliveryType === "delivery" ? address : null,
      }));

      await placeBatchOrder(itemsWithDelivery);
      clearCart();
      setIsPaymentOpen(false);
      navigate("/my-orders");
    } catch {
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
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't added any print services yet.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-95">
            Explore Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">

      {/* Discount Toast */}
      {showToast && appliedDiscount && (
        <DiscountToast
          discount={appliedDiscount.discount}
          serviceName={appliedDiscount.serviceName}
          onClose={() => setShowToast(false)}
        />
      )}

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
                <div className="text-right">
                  {item.originalAmount && item.originalAmount > item.totalAmount && (
                    <p className="text-xs text-gray-400 line-through font-bold">₹{Number(item.originalAmount).toFixed(2)}</p>
                  )}
                  <p className="font-extrabold text-xl text-gray-900">₹{Number(item.totalAmount).toFixed(2)}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
          ))}

          {/* Delivery Config */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-orange-500" /> Delivery Options</h3>
            <div className="flex gap-4 mb-6">
              <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-colors ${deliveryType === "pickup" ? "bg-orange-50 border-orange-500 font-bold text-orange-900" : "hover:bg-gray-50 border-gray-200"}`}>
                <input type="radio" name="deliveryType" className="sr-only" checked={deliveryType === "pickup"} onChange={() => setDeliveryType("pickup")} />
                Store Pickup (Free)
              </label>
              <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-colors ${deliveryType === "delivery" ? "bg-orange-50 border-orange-500 font-bold text-orange-900" : "hover:bg-gray-50 border-gray-200"}`}>
                <input type="radio" name="deliveryType" className="sr-only" checked={deliveryType === "delivery"} onChange={() => setDeliveryType("delivery")} />
                Door Delivery (≈ ₹{deliveryFee || "?"})
              </label>
            </div>

            {deliveryType === "delivery" && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-4 w-4" /> Enter Delivery Address</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <textarea 
                    placeholder="Enter full delivery address (e.g. Door No, Street, Landmark, City, PIN)" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    className="border p-4 rounded-xl focus:ring-orange-500 outline-none focus:ring-2 border-gray-200 w-full h-32"
                  />
                </div>
                {address && (
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex justify-between items-center text-sm font-medium animate-in fade-in zoom-in-95">
                    {isCalculatingDistance ? (
                      <span className="flex items-center gap-2 text-blue-600"><div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full"></div> Querying Satellite Coordinates...</span>
                    ) : (
                      <span>Point-to-Point Distance: {deliveryDistanceKm.toFixed(1)} km</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 text-lg mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-medium text-gray-900">₹{originalSubtotal.toFixed(2)}</span>
              </div>

              {/* Active discount line */}
              {discountSavings > 0 && (
                <div className="flex justify-between text-green-700 bg-green-50 rounded-xl px-3 py-2 border border-green-100 animate-in fade-in zoom-in-95 duration-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Tag className="h-3.5 w-3.5" />
                    Offer Savings
                  </span>
                  <span className="font-black text-green-700">-₹{discountSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 border-t border-gray-50 pt-2">
                <span>Services Total</span>
                <span className="font-medium text-gray-900">₹{cartTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-900">{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-8">
              <div className="flex justify-between items-center bg-orange-50 rounded-xl p-4 border border-orange-100">
                <span className="font-bold text-orange-900">Total Amount</span>
                <span className="text-3xl font-black text-orange-600">₹{finalTotal.toFixed(2)}</span>
              </div>
              {discountSavings > 0 && (
                <p className="text-center text-xs text-green-600 font-bold mt-2">
                  🎉 You saved ₹{discountSavings.toFixed(2)} with current offers!
                </p>
              )}
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
        totalAmount={finalTotal}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CartPage;
