import React, { useState, useEffect } from "react";
import shopService from "../../services/shopService";
import { BarChart3, TrendingUp, MapPin, Printer, Activity, DollarSign } from "lucide-react";

const ShopAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await shopService.getShopAnalytics();
        setAnalytics(data.analytics);
      } catch (err) {
        console.error("Failed to load full analytics:", err);
        setAnalytics({
           totalOrders: 0,
           totalRevenue: 0,
           monthlyRevenue: 0,
           weeklyRevenue: 0,
           revenueTrend: [],
           topServices: [],
           ordersByArea: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Precompute maximums for the visual bars scaling
  const maxRevenueTrend = analytics.revenueTrend?.length > 0 
    ? Math.max(...analytics.revenueTrend.map(d => d.earned), 10) 
    : 100;
  
  const maxServiceRevenue = analytics.topServices?.length > 0
    ? Math.max(...analytics.topServices.map(s => s.revenue), 10)
    : 100;
    
  const maxAreaCount = analytics.ordersByArea?.length > 0
    ? Math.max(...analytics.ordersByArea.map(a => a.count), 5)
    : 100;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
            <BarChart3 className="h-48 w-48 text-orange-500" />
         </div>
         <div className="relative z-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
               <BarChart3 className="h-8 w-8 text-orange-500" />
               Deep Store Analytics
            </h1>
            <p className="text-gray-500 font-medium">Actionable business intelligence and geospatial metrics derived directly from your completed orders.</p>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 relative z-10 border-t border-gray-50 pt-8">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Lifetime Revenue</p>
               <p className="text-3xl font-black text-gray-900">₹{Number(analytics.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Gross Print Jobs</p>
               <p className="text-3xl font-black text-gray-900">{analytics.totalOrders}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">MTD Sales</p>
               <p className="text-3xl font-black text-green-600">₹{Number(analytics.monthlyRevenue).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">WTD Sales</p>
               <p className="text-3xl font-black text-orange-600">₹{Number(analytics.weeklyRevenue).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         
         {/* Top Services Block */}
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
               <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Printer className="h-5 w-5 text-purple-500 bg-purple-50 rounded-md p-0.5" /> 
                  Bestselling Services
               </h3>
               <span className="text-xs font-bold bg-gray-50 text-gray-500 px-3 py-1 rounded-full uppercase tracking-wider">Top 5</span>
            </div>
            
            <div className="space-y-6">
               {analytics.topServices?.length > 0 ? (
                  analytics.topServices.map((service, idx) => {
                     const pct = Math.max((service.revenue / maxServiceRevenue) * 100, 2);
                     return (
                        <div key={idx} className="group">
                           <div className="flex justify-between items-end mb-2">
                              <div>
                                 <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors uppercase tracking-wider text-sm">{service.name}</p>
                                 <p className="text-xs font-medium text-gray-400">{service.count} Orders</p>
                              </div>
                              <div className="font-black text-gray-900">
                                 ₹{service.revenue.toFixed(0)}
                              </div>
                           </div>
                           <div className="w-full bg-gray-50 rounded-full h-3 overflow-hidden">
                              <div 
                                 className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
                                 style={{ width: `${pct}%` }}
                              ></div>
                           </div>
                        </div>
                     );
                  })
               ) : (
                  <div className="py-12 text-center text-gray-400 font-medium italic">
                     No sales data recorded to rank services yet.
                  </div>
               )}
            </div>
         </div>

         {/* Geospatial Area Block */}
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
               <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500 bg-blue-50 rounded-md p-0.5" /> 
                  Geographical Reach
               </h3>
               <span className="text-xs font-bold bg-gray-50 text-gray-500 px-3 py-1 rounded-full uppercase tracking-wider">Top 6 Regions</span>
            </div>
            
            <div className="space-y-6">
               {analytics.ordersByArea?.length > 0 ? (
                  analytics.ordersByArea.map((loc, idx) => {
                     const pct = Math.max((loc.count / maxAreaCount) * 100, 5);
                     return (
                        <div key={idx} className="group">
                           <div className="flex justify-between items-end mb-2">
                              <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors capitalize text-sm">{loc.area}</p>
                              <div className="font-black text-gray-900 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">
                                 {loc.count} Jobs
                              </div>
                           </div>
                           <div className="w-full bg-gray-50 rounded-full h-3 overflow-hidden">
                              <div 
                                 className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                                 style={{ width: `${pct}%` }}
                              ></div>
                           </div>
                        </div>
                     );
                  })
               ) : (
                  <div className="py-12 text-center text-gray-400 font-medium italic">
                     No delivery metrics logged yet.
                  </div>
               )}
            </div>
         </div>

      </div>

      {/* 6-Month Timeline Expansion */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
         <div className="flex items-center justify-between mb-12 border-b border-gray-50 pb-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
               <Activity className="h-5 w-5 text-orange-500 bg-orange-50 rounded-md p-0.5" /> 
               Scaling Velocity (6 Months)
            </h3>
         </div>
         
         {analytics.revenueTrend?.length > 0 ? (
           <div className="h-64 flex items-end justify-between gap-4 px-4 max-w-4xl mx-auto">
             {analytics.revenueTrend.map((dataPoint, idx) => {
                const heightPct = Math.max((dataPoint.earned / maxRevenueTrend) * 100, 2);
                
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="w-full flex justify-center mb-3">
                      <div className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-sm">
                        ₹{dataPoint.earned.toFixed(0)}
                      </div>
                    </div>
                    <div className="w-full max-w-[80px] bg-gray-50 rounded-t-2xl overflow-hidden relative flex-1 flex flex-col justify-end">
                       <div 
                         className="w-full bg-gradient-to-t from-orange-600 to-orange-400 opacity-90 group-hover:opacity-100 rounded-t-2xl transition-all duration-1000 ease-out" 
                         style={{ height: `${heightPct}%` }}
                       ></div>
                    </div>
                    <div className="mt-4 text-sm font-bold text-gray-500 tracking-widest uppercase">
                      {dataPoint.month} <span className="text-[10px] opacity-60">'{dataPoint.year.toString().slice(-2)}</span>
                    </div>
                  </div>
                );
             })}
           </div>
         ) : (
           <div className="h-64 flex items-center justify-center text-gray-400 font-medium italic">
             No historical timeframe generated.
           </div>
         )}
      </div>

    </div>
  );
};

export default ShopAnalytics;
