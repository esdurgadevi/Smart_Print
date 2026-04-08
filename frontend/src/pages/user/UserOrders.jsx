import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, FileText, Clock, ExternalLink, Store, Package, Star, MapPin, Truck } from "lucide-react";
import { getMyOrders, getLiveTracking } from "../../services/orderService";
import FeedbackModal from "../../components/user/FeedbackModal";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [feedbackOrder, setFeedbackOrder] = useState(null);
  
  // Tracking State
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const pollInterval = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data.orders);
    } catch (err) {
      setError("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  const startTracking = (order) => {
    setTrackingOrder(order);
    fetchTrackingData(order.id);
    pollInterval.current = setInterval(() => {
      fetchTrackingData(order.id);
    }, 5000);
  };

  const stopTracking = () => {
    setTrackingOrder(null);
    setTrackingData(null);
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
    }
  };

  const fetchTrackingData = async (orderId) => {
    try {
      const data = await getLiveTracking(orderId);
      setTrackingData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleFeedbackSuccess = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, isReviewed: true } : o));
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag className="h-8 w-8 text-orange-500" />
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100 text-center">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <Package className="h-20 w-20 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            You haven't placed any print orders yet. Start exploring local shops to place your first order.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-95"
          >
            Explore Shops
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative group">
               <div className="p-6 border-b border-gray-50">
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                       {order.status}
                     </span>
                     <span className="text-xs text-gray-400 font-medium">#{order.id.toString().padStart(4, '0')}</span>
                   </div>
                   <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                     <Clock className="h-4 w-4" /> {new Date(order.createdAt).toLocaleDateString()}
                   </span>
                 </div>
                 
                 <div className="flex items-start gap-4 mb-2">
                   <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                     <Store className="h-6 w-6 text-gray-400" />
                   </div>
                   <div>
                     <h3 className="font-bold text-gray-900 truncate pr-2 max-w-[200px]">{order.shop?.shopName || "Unknown Shop"}</h3>
                     <p className="text-sm text-gray-500 truncate max-w-[200px]">{order.service?.serviceName || "Unknown Service"}</p>
                   </div>
                 </div>
                 
                 {/* Show Delivery Status if applicable */}
                 {order.deliveryType === 'delivery' && (
                    <p className="text-xs font-bold text-orange-600 mt-2 bg-orange-50 inline-block px-2 py-1 rounded">
                      Delivery: {order.deliveryStatus ? order.deliveryStatus.toUpperCase() : "PENDING"}
                    </p>
                 )}
               </div>

               <div className="p-6 bg-gray-50 flex-1">
                 <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3 shadow-sm mb-6">
                   {order.documentUrl && (
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-500 flex items-center gap-2"><FileText className="h-4 w-4" /> Document</span>
                       {/* Hardcoding localhost for demo purposes if backend isn't returning full url, adapt based on setup */}
                       <a href={`http://localhost:5000${order.documentUrl}`} target="_blank" rel="noreferrer" className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                         View <ExternalLink className="h-3 w-3" />
                       </a>
                     </div>
                   )}
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-500">Pages/Copy</span>
                     <span className="font-bold text-gray-900">{order.pageRange && order.pageRange.trim() !== "" && order.pageRange.toLowerCase() !== "all" ? order.pageRange : 'All'} ({order.pageCount || 1})</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-500">Total Copies</span>
                     <span className="font-bold text-gray-900">{order.copies}</span>
                   </div>
                 </div>

                 <div className="flex items-center justify-between border-t border-gray-200/60 pt-4 mt-auto">
                    <span className="text-gray-500 text-sm font-medium">Total Cost</span>
                    <span className="text-xl font-extrabold text-orange-600">₹{Number(order.totalAmount).toFixed(2)}</span>
                 </div>

                 {order.deliveryType === 'delivery' && (order.deliveryStatus === 'assigned' || order.deliveryStatus === 'picked_up') && (
                   <button 
                     onClick={() => startTracking(order)}
                     className="w-full mt-4 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                   >
                     <Truck className="h-4 w-4" /> Track Live Delivery
                   </button>
                 )}

                 {order.status === "completed" && !order.isReviewed && (
                   <button 
                     onClick={() => setFeedbackOrder(order)}
                     className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                   >
                     <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Leave a Review
                   </button>
                 )}
                 {order.isReviewed && (
                   <div className="w-full mt-4 bg-gray-100 text-gray-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm border border-gray-200">
                     <Star className="h-4 w-4" /> Reviewed
                   </div>
                 )}
               </div>
            </div>
          ))}
        </div>
      )}

      {feedbackOrder && (
        <FeedbackModal 
          isOpen={!!feedbackOrder}
          onClose={() => setFeedbackOrder(null)}
          orderId={feedbackOrder.id}
          shopId={feedbackOrder.shopId}
          onSuccess={handleFeedbackSuccess}
        />
      )}

      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={stopTracking} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 font-bold p-2 bg-gray-100 rounded-full">
              X
            </button>
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <Truck className="h-8 w-8" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
              </div>
              <h2 className="text-2xl font-black text-gray-900">Live Tracking</h2>
              <p className="text-sm text-gray-500">Order #{trackingOrder.id.toString().padStart(4, '0')}</p>
            </div>

            {trackingData ? (
               <div className="space-y-4">
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Driver Coordinates</p>
                   <p className="font-mono text-sm text-gray-800">
                     Lat: <span className="font-bold">{trackingData.driverLocation?.latitude?.toFixed(4) || "N/A"}</span><br/>
                     Lng: <span className="font-bold">{trackingData.driverLocation?.longitude?.toFixed(4) || "N/A"}</span>
                   </p>
                   <p className="text-xs text-gray-400 mt-2 bg-white inline-block px-2 py-1 rounded shadow-sm border border-gray-200">Polling every 5s</p>
                 </div>

                 {trackingData.deliveryOtp && trackingOrder.deliveryStatus === 'picked_up' && (
                   <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
                     <p className="text-xs text-orange-800 font-bold uppercase mb-1">Your Delivery OTP</p>
                     <p className="text-3xl tracking-widest font-mono text-orange-600 font-black mb-1">{trackingData.deliveryOtp}</p>
                     <p className="text-[10px] uppercase font-bold text-orange-600 leading-tight">Share this with driver upon arrival</p>
                   </div>
                 )}
               </div>
            ) : (
               <div className="text-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                 <p className="text-sm text-gray-500 mt-4">Pinging GPS satellite...</p>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
