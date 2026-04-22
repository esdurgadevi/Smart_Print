import React, { useState, useEffect } from "react";
import { Package, Clock, CheckCircle2, XCircle, Search, Filter, ArrowUp, ArrowDown, ListOrdered, ChevronDown, FileText } from "lucide-react";
import { getShopOrders, updateOrderStatus, updateOrderPriority } from "../../services/orderService";
import shopService from "../../services/shopService";

const ShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [queueType, setQueueType] = useState("FIFO");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getShopOrders();
      setOrders(data.orders);
      setQueueType(data.queueType || "FIFO");
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

  const handleUpdatePriority = async (orderId, currentPriority, direction) => {
    try {
      const newPriority = direction === 'up' ? currentPriority + 1 : Math.max(0, currentPriority - 1);
      await updateOrderPriority(orderId, newPriority);
      // Refresh to get new sorted list
      fetchOrders();
    } catch (err) {
      alert("Failed to update priority");
    }
  };

  const handleQueueTypeChange = async (newType) => {
    try {
      await shopService.updateShop({ queueType: newType });
      setQueueType(newType);
      // Re-fetch orders to see them in new sorted order
      fetchOrders();
    } catch (err) {
      alert("Failed to update queue strategy");
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
          <div className="flex items-center gap-2 mt-2">
            <p className="text-gray-500">Manage customer requests and update print statuses.</p>
            
            {/* Strategy Switcher */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                 <ListOrdered className="h-3 w-3 text-orange-600" />
                 <span className="text-[10px] font-black text-orange-700 uppercase tracking-tight">{queueType} Active</span>
                 <ChevronDown className="h-3 w-3 text-orange-400" />
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Select Strategy</p>
                {['FIFO', 'SJF', 'MANUAL'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleQueueTypeChange(type)}
                    className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-between ${queueType === type ? 'text-orange-600' : 'text-gray-600'}`}
                  >
                    {type === 'FIFO' ? 'FIFO (Default)' : type === 'SJF' ? 'SJF (Shortest Job)' : 'Manual Priority'}
                    {queueType === type && <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
            <div key={order.id} className={`bg-white rounded-3xl p-6 shadow-sm border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md ${order.batchId ? 'border-l-4 border-l-blue-500 border-gray-100' : 'border-gray-100'}`}>
               
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-gray-900 leading-none">Order #{order.id.toString().padStart(4, '0')}</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {order.batchId && (
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded leading-none border border-blue-100">
                            Batch: {order.batchId.split('-').pop()}
                          </span>
                        )}
                        {order.splitType && (
                          <span className={`${order.splitType === 'Color' ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-gray-600 bg-gray-50 border-gray-200'} text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded leading-none border`}>
                            {order.splitType} SECTION
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 ml-auto md:ml-0">
                      <Clock className="h-3 w-3 "/> {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Customer Info</p>
                      <p className="font-bold text-gray-900">{order.user?.name || "Unknown"}</p>
                      <p className="text-sm text-gray-600">{order.user?.email}</p>
                    </div>
                    <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100 flex flex-col justify-center">
                      <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Service Details
                      </p>
                      <h4 className="font-black text-gray-900 text-lg leading-tight mb-2">{order.service?.serviceName}</h4>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-orange-200 flex items-center gap-2 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Pages</span>
                          <span className="text-sm font-black text-orange-700">{order.pageRange && order.pageRange !== "" ? order.pageRange : "ALL"}</span>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-orange-200 flex items-center gap-2 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Copies</span>
                          <span className="text-sm font-black text-orange-700">{order.copies}</span>
                        </div>
                      </div>

                      {order.documentUrl && (
                        <a href={`http://localhost:5000${order.documentUrl}`} target="_blank" rel="noreferrer" className="mt-4 bg-gray-900 hover:bg-black text-white text-xs font-black py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-gray-200">
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
                    {/* Priority Controls for Manual Mode */}
                    {queueType === 'MANUAL' && ['pending', 'accepted'].includes(order.status) && (
                      <div className="flex gap-2 mb-2">
                        <button 
                          onClick={() => handleUpdatePriority(order.id, order.priority, 'up')}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl flex items-center justify-center transition-all"
                          title="Move Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdatePriority(order.id, order.priority, 'down')}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl flex items-center justify-center transition-all"
                          title="Move Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}

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
