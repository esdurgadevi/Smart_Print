import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import superAdminService from "../../services/superAdminService";
import { Users, Store, TrendingUp, DollarSign, Activity } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    totalUsers: 0,
    totalShops: 0,
    totalOrders: 0,
    totalPlatformRevenue: 0,
    revenueTrend: [],
    recentUsers: [],
    recentShops: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await superAdminService.getPlatformAnalytics();
        setData(res.analytics);
      } catch (err) {
        console.error("Failed to load admin tracking", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = [
    { label: "Total Users", value: data.totalUsers.toLocaleString(), icon: Users },
    { label: "Print Shops", value: data.totalShops.toLocaleString(), icon: Store },
    { label: "Total Completed Orders", value: data.totalOrders.toLocaleString(), icon: TrendingUp },
    { label: "Gross Platform Revenue", value: `₹${Number(data.totalPlatformRevenue).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, icon: DollarSign },
  ];

  if (loading) {
     return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-orange-500" /> Executive Platform Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, Super Admin {user?.name}. Here is the holistic status of PrintHub.</p>
      </div>

      {/* Top Value Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">{stat.value}</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <stat.icon className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Graph Block */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8">
         <div className="flex items-center justify-between mb-8 text-gray-900 border-b border-gray-50 pb-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-orange-500 bg-orange-50 p-0.5 rounded-full" /> 6-Month Global Economics Trail</h3>
         </div>
         
         {data.revenueTrend && data.revenueTrend.length > 0 ? (
           <div className="h-48 flex items-end justify-between gap-4 px-4">
             {data.revenueTrend.map((dataPoint, idx) => {
                const maxRevenue = Math.max(...data.revenueTrend.map(d => d.earned), 100); 
                const heightPct = Math.max((dataPoint.earned / maxRevenue) * 100, 5); 
                
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="w-full flex justify-center mb-2">
                      <div className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap">
                        ₹{dataPoint.earned.toFixed(0)}
                      </div>
                    </div>
                    <div className="w-full max-w-[60px] bg-gray-50 rounded-t-xl overflow-hidden relative flex-1 flex flex-col justify-end">
                       <div 
                         className="w-full bg-orange-500 group-hover:bg-orange-400 rounded-t-xl transition-all duration-1000 ease-out" 
                         style={{ height: `${heightPct}%` }}
                       ></div>
                    </div>
                    <div className="mt-4 text-sm font-bold text-gray-500 tracking-wider uppercase">
                      {dataPoint.month}
                    </div>
                  </div>
                );
             })}
           </div>
         ) : (
           <div className="h-48 flex items-center justify-center text-gray-400 font-medium italic">
             No historical data available.
           </div>
         )}
      </div>

      {/* Recency Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4 border-b border-gray-50 pb-2">Newest Registered Users</h2>
          <div className="space-y-4 pt-2">
            {data.recentUsers.length === 0 ? (
               <p className="text-gray-400 text-center py-4 italic text-sm">No recent users</p>
            ) : (
               data.recentUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {u.name.charAt(0)}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                     </div>
                     <div className="ml-auto text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                        {new Date(u.createdAt).toLocaleDateString()}
                     </div>
                  </div>
               ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4 border-b border-gray-50 pb-2">Newest Print Shops</h2>
          <div className="space-y-4 pt-2">
            {data.recentShops.length === 0 ? (
               <p className="text-gray-400 text-center py-4 italic text-sm">No recent shops</p>
            ) : (
               data.recentShops.map(s => (
                  <div key={s.id} className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                        {s.logoUrl ? <img src={s.logoUrl} alt="logo" className="h-full w-full object-cover" /> : <Store className="h-5 w-5" />}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900">{s.shopName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{s.address}</p>
                     </div>
                     <div className="ml-auto text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                        {new Date(s.createdAt).toLocaleDateString()}
                     </div>
                  </div>
               ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;