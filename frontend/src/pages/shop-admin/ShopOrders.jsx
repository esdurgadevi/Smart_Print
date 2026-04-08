import React, { useState, useEffect } from "react";
import { Package, Clock, CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { getShopOrders, updateOrderStatus } from "../../services/orderService";

const ShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getShopOrders();
      setOrders(data.orders);
    } catch (err) {
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state smoothly
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(o => filter === "all" || o.status === filter);

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-orange-500" /> Incoming Orders
          </h1>
          <p className="text-gray-500 mt-2">Manage customer requests and update print statuses.</p>
        </div>
        
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {['all', 'pending', 'accepted', 'completed'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium text-center">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <Package className="h-20 w-20 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Orders</h2>
          <p className="text-gray-500">You haven't received any orders yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
               
               <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-3">
                   <span className="text-lg font-bold text-gray-900">Order #{order.id.toString().padStart(4, '0')}</span>
                   <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3 "/> {new Date(order.createdAt).toLocaleString()}</span>
                 </div>

                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="bg-gray-50 rounded-xl p-4">
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Customer Info</p>
                     <p className="font-bold text-gray-900">{order.user?.name || "Unknown"}</p>
                     <p className="text-sm text-gray-600">{order.user?.email}</p>
                   </div>
                   <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                     <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Service Details</p>
                     <p className="font-bold text-gray-900">{order.service?.serviceName}</p>
                     <p className="text-sm text-gray-700 font-medium">Pages: {order.pageRange && order.pageRange !== "" ? order.pageRange : "All"} • Copies: {order.copies}</p>
                     {order.documentUrl && (
                       <a href={`http://localhost:5000${order.documentUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-bold block mt-2">
                         Download Document
                       </a>
                     )}
                   </div>
                 </div>
               </div>

               <div className="md:w-64 shrink-0 flex flex-col items-end gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 pl-0 md:pl-6">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 font-medium block">Order Value</span>
                    <span className="text-2xl font-black text-orange-600">₹{Number(order.totalAmount).toFixed(2)}</span>
                  </div>

                  {order.deliveryType === 'delivery' && order.pickupOtp && (
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg w-full text-center mt-2">
                       <p className="text-xs text-orange-800 font-bold uppercase mb-1">Pickup OTP</p>
                       <p className="text-2xl tracking-widest font-mono text-orange-600 font-black">{order.pickupOtp}</p>
                       <p className="text-[10px] text-orange-600 mt-1 leading-tight">Share with Driver to dispatch</p>
                    </div>
                  )}

                  <div className="space-y-2 w-full mt-2">
                    {order.status === "pending" && (
                      <>
                        <button onClick={() => handleUpdateStatus(order.id, 'accepted')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all text-sm">
                          Accept Order
                        </button>
                        <button onClick={() => handleUpdateStatus(order.id, 'rejected')} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl transition-all text-sm">
                          Reject
                        </button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 transition-all text-sm">
                        <CheckCircle2 className="h-5 w-5" /> Mark Completed
                      </button>
                    )}
                    {order.status === "completed" && (
                      <div className="w-full bg-gray-100 text-green-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm border border-green-200">
                        <CheckCircle2 className="h-5 w-5" /> Completed
                      </div>
                    )}
                    {order.status === "rejected" && (
                      <div className="w-full bg-red-100 text-red-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm border border-red-200">
                        <XCircle className="h-5 w-5" /> Rejected
                      </div>
                    )}
                  </div>
               </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopOrders;
