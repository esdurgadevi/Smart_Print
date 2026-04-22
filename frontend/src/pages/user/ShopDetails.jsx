import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import shopService from "../../services/shopService";
import { Store, MapPin, ArrowLeft, Package, Clock, ShieldCheck, ShoppingCart, Trash2, CheckCircle2, Star, MessageSquare, Phone, Mail, Navigation, X, Tag, Users } from "lucide-react";
import OrderModal from "../../components/user/OrderModal";
import { useCart } from "../../context/CartContext";
import { placeBatchOrder } from "../../services/orderService";
import { getShopFeedback } from "../../services/feedbackService";
import { getShopStatus } from "../../utils/shopUtils";
import axios from "axios";

const discountApi = axios.create({ baseURL: "http://localhost:5000/api/discounts" });

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState([]); // active discounts for this shop

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const { cartItems, cartTotal, cartShopId, removeFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchShopDetails();
    fetchFeedbacks();
    fetchDiscounts();
  }, [id]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const data = await shopService.getShopDetails(id);
      setShop(data.shop);
    } catch (error) {
      console.error("Failed to fetch shop details", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const data = await getShopFeedback(id);
      setFeedbacks(data.feedbacks);
      setAverageRating(data.averageRating);
    } catch (err) {
      console.log("Failed to load feedbacks");
    }
  };

  const fetchDiscounts = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await discountApi.get(`/public/${id}`);
      const active = (res.data.discounts || []).filter(d =>
        d.isActive &&
        (!d.startDate || d.startDate <= today) &&
        (!d.endDate || d.endDate >= today)
      );
      setDiscounts(active);
    } catch (err) {
      // no discounts or network error — silently skip
      setDiscounts([]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-20">
        <Store className="h-20 w-20 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold">Shop Not Found</h2>
        <button onClick={() => navigate("/dashboard")} className="mt-4 text-orange-500 font-medium">
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 group transition-colors"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        Back to Shops
      </button>

      {/* Shop Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="h-48 md:h-64 bg-gray-100 relative">
          {shop.logoUrl ? (
            <img src={shop.logoUrl} alt={shop.shopName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600">
              <Store className="h-24 w-24 text-white opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-white mb-2 leading-tight flex items-center gap-3">
                {shop.shopName}
                {(() => {
                  const status = getShopStatus(shop.storeHours);
                  return (
                    <span className={`px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border ${
                      status.isOpen 
                      ? "bg-green-500/20 text-green-300 border-green-500/30" 
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                    }`}>
                      <div className={`h-2 w-2 rounded-full ${status.isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
                      {status.status}
                    </span>
                  );
                })()}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-200 font-medium mb-6">
                <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full text-sm">
                  <MapPin className="h-4 w-4" /> {shop.address}
                </span>
                  <span className="flex items-center gap-1 bg-orange-500/20 text-orange-200 px-3 py-1 rounded-full text-sm">
                    <Star className="h-4 w-4 fill-orange-500" />
                    {averageRating > 0 ? `${averageRating.toFixed(1)} (${feedbacks.length} reviews)` : "New Shop"}
                  </span>
                  <span className="flex items-center gap-1 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm">
                    <Users className="h-4 w-4" />
                    {shop.queueCount || 0} In Queue
                  </span>
                </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="text-gray-600 text-lg leading-relaxed">
            {shop.description || "No description provided."}
          </div>

          {/* Quick Stats/Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-center gap-3 text-gray-800 font-medium">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Ready Time</p>
                <p className="text-sm italic">Usually 2 hours</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center gap-3 text-gray-800 font-medium">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Quality</p>
                <p className="text-sm italic">Guaranteed</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center gap-3 text-gray-800 font-medium">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Current Queue</p>
                <p className="text-sm italic">{shop.queueCount || 0} Orders Waiting</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
              <Phone className="h-4 w-4 text-orange-500" /> Contact Shop
            </h4>
            <div className="space-y-4">
              {shop.phone && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{shop.phone}</span>
                </div>
              )}
              {shop.whatsapp && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shadow-sm">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{shop.whatsapp}</span>
                </div>
              )}
              {shop.email && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 truncate">{shop.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shop Services */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-heading mb-8 flex items-center gap-3">
          <Package className="h-8 w-8 text-orange-500" />
          Available Services
        </h2>

        {shop.services?.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold">No Services Found</h3>
            <p className="text-gray-500 mt-2">This shop hasn't added any services yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shop.services.map((service) => {
              // Find any active discount for this service
              const serviceDiscount = discounts.find(d => Number(d.serviceId) === Number(service.id));
              return (
                <div key={service.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col relative overflow-hidden group">
                  {service.imageUrl && (
                    <div className="-mx-6 -mt-6 mb-6 h-48 bg-gray-100 overflow-hidden">
                      <img src={service.imageUrl} alt={service.serviceName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 pr-16">{service.serviceName}</h3>
                    <p className="text-gray-500 mt-2 mb-4 text-sm flex-1">{service.description}</p>

                    {/* Discount Offer Banner */}
                    {serviceDiscount && (
                      <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <div className="h-8 w-8 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                          <Tag className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-green-700 uppercase tracking-wider">
                            {Number(serviceDiscount.discountPercentage).toFixed(0)}% OFF Offer Active!
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            Spend ₹{serviceDiscount.minQuantity} or more on this service to unlock the discount
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-auto">
                      <div>
                        <span className="text-2xl font-extrabold text-gray-900">
                          ₹{Number(service.price).toFixed(2)}
                        </span>
                        {serviceDiscount && (
                          <span className="ml-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            -{Number(serviceDiscount.discountPercentage).toFixed(0)}% available
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => { setSelectedService(service); setIsModalOpen(true); }}
                        className="bg-orange-100 hover:bg-orange-500 text-orange-700 hover:text-white px-6 py-2.5 rounded-full font-bold transition-colors active:scale-95 shadow-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
            <Star className="h-6 w-6 text-orange-500 fill-orange-500" /> Customer Reviews
          </h2>

          {feedbacks.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl">
              <MessageSquare className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium">No reviews yet for this shop.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">{fb.user?.name || "Customer"}</span>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200">
                      <span className="text-sm font-bold">{fb.rating}</span>
                      <Star className="h-3 w-3 text-orange-500 fill-orange-500" />
                    </div>
                  </div>
                  {fb.comment && <p className="text-gray-600 text-sm mt-2">&quot;{fb.comment}&quot;</p>}
                  <p className="text-xs text-gray-400 mt-4">{new Date(fb.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Map Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tight text-sm">
                <Navigation className="h-4 w-4 text-orange-500" /> Find on Map
              </h4>
            </div>
            <div className="h-64 w-full bg-gray-100">
              {shop.fullAddress ? (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(shop.fullAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  title="Shop Location"
                ></iframe>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center italic">
                  <MapPin className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-xs">Location coordinates not available</p>
                </div>
              )}
            </div>
            {shop.fullAddress && (
              <div className="p-6 bg-orange-50/50">
                <p className="text-sm text-gray-700 font-medium flex items-start gap-2 leading-relaxed">
                  <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  {shop.fullAddress}
                </p>
                {shop.directions && (
                  <p className="text-xs text-orange-700 mt-2 font-semibold bg-orange-100/50 px-2 py-1 rounded inline-block">
                    Landmark: {shop.directions}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Store Hours */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl">
            <h4 className="font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-xs text-orange-400">
              <Clock className="h-4 w-4" /> Trading Hours
            </h4>
            <div className="space-y-3">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className={`flex justify-between items-center py-2 px-3 rounded-xl border-b border-gray-800 last:border-0 ${day === new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase() ? 'bg-gray-800/50 ring-1 ring-orange-500/30 shadow-sm shadow-orange-950' : ''}`}>
                  <span className={`capitalize text-xs font-semibold tracking-wide ${day === new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase() ? 'text-orange-400' : 'text-gray-400'}`}>{day}</span>
                  <span className={`text-xs font-bold ${shop.storeHours?.[day]?.toLowerCase() === 'closed' ? 'text-red-400' : 'text-gray-100'}`}>
                    {shop.storeHours?.[day] || "Not Set"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shopId={shop.id}
        service={selectedService}
        allServices={shop.services} // Pass all services for pairing
        discounts={discounts}
        storeHours={shop.storeHours}
        queueCount={shop.queueCount}
      />

      {/* Floating Cart / Checkout Banner */}
      {cartItems.length > 0 && cartShopId === shop.id && !checkoutSuccess && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-white via-white to-transparent pb-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between bg-gray-900 text-white rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="cursor-pointer" onClick={() => setIsCartOpen(!isCartOpen)}>
              <h4 className="font-bold text-lg flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-orange-400" /> {cartItems.length} Item(s) Addded</h4>
              <p className="text-orange-300 font-extrabold text-sm">Total: ₹{cartTotal.toFixed(2)}</p>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm md:text-base active:scale-95 shadow-md shadow-orange-900/20"
            >
              View Cart & Checkout
            </button>
          </div>
        </div>
      )}

      {/* Cart Modal Slide-up */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Your Cart</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="p-8 text-center">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Order Successfully Placed!</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">All items from your cart have been submitted to {shop.shopName}.</p>
                <button onClick={() => { setIsCartOpen(false); setCheckoutSuccess(false); navigate('/my-orders'); }} className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold w-full transition-all">
                  Go to My Orders
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  {cartItems.map((item, idx) => (
                    <div key={item.id || idx} className="flex justify-between items-start border border-gray-100 bg-gray-50 p-4 rounded-2xl">
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{item.service?.serviceName || "Print Service"}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.copies} Copie(s) • Pages: {item.pageRange && item.pageRange !== "" && item.pageRange.toLowerCase() !== "all" ? item.pageRange : "All"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-extrabold text-gray-900">₹{Number(item.totalAmount).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {cartItems.length === 0 && <p className="text-center text-gray-500 py-10 font-medium">Your cart is empty.</p>}
                </div>

                {cartItems.length > 0 && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold text-gray-600">Grand Total</span>
                      <span className="text-2xl font-extrabold text-gray-900">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          setCheckingOut(true);
                          await placeBatchOrder(cartItems);
                          clearCart();
                          setCheckoutSuccess(true);
                        } catch (error) {
                          alert("Failed to place batch order");
                        } finally {
                          setCheckingOut(false);
                        }
                      }}
                      disabled={checkingOut}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
                    >
                      {checkingOut ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Confirm Checkout"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetails;
