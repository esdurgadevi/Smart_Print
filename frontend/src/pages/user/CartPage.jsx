import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Trash2, ShoppingCart, ArrowLeft, ShieldCheck, Truck, MapPin } from "lucide-react";
import PaymentModal from "../../components/user/PaymentModal";
import { placeBatchOrder } from "../../services/orderService";
import shopService from "../../services/shopService";

const CartPage = () => {
  const { cartItems, cartTotal, cartShopId, removeFromCart, clearCart } = useCart();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [address, setAddress] = useState({ doorNo: "", street: "", city: "", pincode: "" });
  const navigate = useNavigate();

  const [shopCoords, setShopCoords] = useState(null);
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Fetch true shop coordinates on mount
  useEffect(() => {
    if (cartShopId) {
      shopService.getShopDetails(cartShopId).then(data => {
         if (data.shop) {
             setShopCoords({ 
                 lat: data.shop.latitude || 13.0827, 
                 lng: data.shop.longitude || 80.2707 
             });
         }
      }).catch(err => console.log("Failed to fetch shop details for distance logic"));
    }
  }, [cartShopId]);

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);  
    const dLon = deg2rad(lon2 - lon1); 
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
  };

  // Debounced real-world API coordinate fetcher
  useEffect(() => {
    const fullAddress = `${address.doorNo} ${address.street} ${address.city} ${address.pincode}`.trim();
    if (fullAddress.length < 5 || !shopCoords) return;

    setIsCalculatingDistance(true);
    const timer = setTimeout(async () => {
      try {
        let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
        let data = await res.json();
        
        // Fallback: If exact street address fails (like "opposite bakery"), search just the city + pincode for a rough estimate
        if (!data || data.length === 0) {
           const fallbackAddress = `${address.city} ${address.pincode}`.trim();
           if (fallbackAddress.length > 3) {
             res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}`);
             data = await res.json();
           }
        }
        
        if (data && data.length > 0) {
           const userLat = parseFloat(data[0].lat);
           const userLng = parseFloat(data[0].lon);
           const distance = getDistanceFromLatLonInKm(shopCoords.lat, shopCoords.lng, userLat, userLng);
           setDeliveryDistanceKm(Math.max(0.5, distance)); // 0.5 minimum
        } else {
           // Ultimate fallback: generate pseudo-distance from string hash if geocoding completely fails
           let hash = 0;
           for (let i = 0; i < fullAddress.length; i++) hash = ((hash << 5) - hash) + fullAddress.charCodeAt(i);
           setDeliveryDistanceKm(1.5 + (Math.abs(hash % 80) / 10)); // 1.5 to 9.5 km
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      } finally {
        setIsCalculatingDistance(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [address, shopCoords]);

  // Base delivery fee = ₹20 + ₹5 per km
  const deliveryFee = deliveryType === "delivery" && deliveryDistanceKm > 0 ? 20 + Math.floor(deliveryDistanceKm * 5) : 0;
  const estimatedTimeMins = Math.floor((deliveryDistanceKm === 0 ? 1 : deliveryDistanceKm) * 5); // roughly 5 mins per km
  
  const finalTotal = cartTotal + deliveryFee;

  const handleCheckoutClick = () => {
    if (deliveryType === "delivery" && (!address.doorNo || !address.street || !address.city || !address.pincode)) {
      alert("Please fill out complete delivery address.");
      return;
    }
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      // Swiggy style: Distribute delivery fee equally across all cart items so it saves into DB correctly
      const splitDeliveryFee = deliveryType === "delivery" && deliveryFee > 0 ? deliveryFee / cartItems.length : 0;

      // Map global delivery settings to each item for backend batch processor
      const itemsWithDelivery = cartItems.map(item => ({
        ...item,
        // The DB now records the actual price they paid (print cost + their share of delivery fee)
        totalAmount: Number(item.totalAmount) + splitDeliveryFee,
        deliveryType,
        deliveryAddress: deliveryType === "delivery" ? address : null,
      }));

      await placeBatchOrder(itemsWithDelivery);
      clearCart();
      setIsPaymentOpen(false);
      navigate("/my-orders");
    } catch (error) {
      alert("Failed to confirm order post-payment.");
      setIsPaymentOpen(false);
    }
  };

  const handleUseMyGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsCalculatingDistance(true);
    
    navigator.geolocation.getCurrentPosition(async (position) => {
       const userLat = position.coords.latitude;
       const userLng = position.coords.longitude;
       
       // Instantly calculate exact distance natively
       if (shopCoords) {
           const distance = getDistanceFromLatLonInKm(shopCoords.lat, shopCoords.lng, userLat, userLng);
           setDeliveryDistanceKm(Math.max(0.1, distance));
       }
       
       // Swiggy Style: Reverse Geocode! Ask satellite what text string corresponds to this GPS point to auto-fill the boxes
       try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}`);
          const data = await res.json();
          if (data && data.address) {
             setAddress({
                doorNo: "", // usually unprovided accurately by GPS
                street: data.address.road || data.address.suburb || data.address.neighbourhood || "",
                city: data.address.city || data.address.town || data.address.county || "",
                pincode: data.address.postcode || ""
             });
          }
       } catch (e) {
          console.error("Reverse geocoding failed");
       } finally {
          setIsCalculatingDistance(false);
       }
    }, (error) => {
       console.error(error);
       alert("Failed to access GPS. Please allow location permissions in your browser.");
       setIsCalculatingDistance(false);
    });
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

          {/* Delivery Configuration Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-orange-500"/> Delivery Options</h3>
            <div className="flex gap-4 mb-6">
              <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-colors ${deliveryType === "pickup" ? "bg-orange-50 border-orange-500 font-bold text-orange-900" : "hover:bg-gray-50 border-gray-200"}`}>
                <input type="radio" name="deliveryType" className="sr-only" checked={deliveryType === "pickup"} onChange={() => setDeliveryType("pickup")} />
                Store Pickup (Free)
              </label>
              <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-colors ${deliveryType === "delivery" ? "bg-orange-50 border-orange-500 font-bold text-orange-900" : "hover:bg-gray-50 border-gray-200"}`}>
                <input type="radio" name="deliveryType" className="sr-only" checked={deliveryType === "delivery"} onChange={() => setDeliveryType("delivery")} />
                Door Delivery (≈ ₹{deliveryFee})
              </label>
            </div>

            {deliveryType === "delivery" && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-4 w-4" /> Enter Delivery Address</p>
                  <button 
                    onClick={handleUseMyGPS}
                    className="text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Truck className="h-3 w-3" /> Fetch Exact GPS
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Door No." value={address.doorNo} onChange={e => setAddress({...address, doorNo: e.target.value})} className="border p-3 rounded-xl focus:ring-orange-500 outline-none focus:ring-2 border-gray-200" />
                  <input type="text" placeholder="Street" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="border p-3 rounded-xl focus:ring-orange-500 outline-none focus:ring-2 border-gray-200" />
                  <input type="text" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="border p-3 rounded-xl focus:ring-orange-500 outline-none focus:ring-2 border-gray-200" />
                  <input type="text" placeholder="PIN Code" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="border p-3 rounded-xl focus:ring-orange-500 outline-none focus:ring-2 border-gray-200" />
                </div>

                {/* Only show estimation if they started typing address */}
                {(address.doorNo || address.street || address.city || address.pincode) && (
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex justify-between items-center text-sm font-medium animate-in fade-in zoom-in-95">
                     {isCalculatingDistance ? (
                       <span className="flex items-center gap-2 text-blue-600"><div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full"></div> Querying Satellite Coordinates...</span>
                     ) : (
                       <>
                         <span>Point-to-Point Distance: {deliveryDistanceKm.toFixed(1)} km</span>
                         <span>Estimated Travel: <span className="font-extrabold">{estimatedTimeMins} mins</span></span>
                       </>
                     )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
           {/* Summary Sidebar */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 text-lg mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} items)</span>
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
