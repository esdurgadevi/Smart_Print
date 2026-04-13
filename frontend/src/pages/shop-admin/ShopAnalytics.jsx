import React, { useState, useEffect } from "react";
import shopService from "../../services/shopService";
import { getDiscounts, createDiscount, toggleDiscount, deleteDiscount } from "../../services/discountService";
import {
  BarChart3, TrendingUp, MapPin, Printer, Activity, DollarSign,
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, Calendar, ShoppingBag, ChevronDown, ChevronUp
} from "lucide-react";

const ShopAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [services, setServices] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    serviceId: "",
    minQuantity: 1,
    discountPercentage: "",
    startDate: "",
    endDate: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [shopData, shopAnalytics, discountData] = await Promise.allSettled([
        shopService.getMyShop(),
        shopService.getShopAnalytics(),
        getDiscounts(),
      ]);

      if (shopData.status === "fulfilled") {
        setServices(shopData.value.shop?.services || []);
      }
      if (shopAnalytics.status === "fulfilled") {
        setAnalytics(shopAnalytics.value.analytics);
      } else {
        setAnalytics({ totalOrders: 0, totalRevenue: 0, monthlyRevenue: 0, weeklyRevenue: 0, revenueTrend: [], topServices: [], ordersByArea: [] });
      }
      if (discountData.status === "fulfilled") {
        setDiscounts(discountData.value.discounts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    try {
      await createDiscount({
        ...discountForm,
        serviceId: Number(discountForm.serviceId),
        minQuantity: Number(discountForm.minQuantity),
        discountPercentage: Number(discountForm.discountPercentage),
      });
      setFormSuccess("Offer created successfully!");
      setDiscountForm({ serviceId: "", minQuantity: 1, discountPercentage: "", startDate: "", endDate: "" });
      setShowDiscountForm(false);
      const data = await getDiscounts();
      setDiscounts(data.discounts || []);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create offer");
    }
  };

  const handleToggle = async (id) => {
    await toggleDiscount(id);
    const data = await getDiscounts();
    setDiscounts(data.discounts || []);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    await deleteDiscount(id);
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const today = new Date().toISOString().split("T")[0];
  const isExpired = (d) => d && new Date(d) < new Date(today);
  const isActive = (disc) => disc.isActive && (!disc.endDate || !isExpired(disc.endDate));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const maxRevenueTrend = analytics?.revenueTrend?.length ? Math.max(...analytics.revenueTrend.map(d => d.earned), 10) : 100;
  const maxServiceRevenue = analytics?.topServices?.length ? Math.max(...analytics.topServices.map(s => s.revenue), 10) : 100;
  const maxAreaCount = analytics?.ordersByArea?.length ? Math.max(...analytics.ordersByArea.map(a => a.count), 5) : 100;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">

      {/* ── HEADER KPI STRIP ── */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
          <BarChart3 className="h-56 w-56 text-orange-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-1 flex items-center gap-3 relative z-10">
          <BarChart3 className="h-8 w-8 text-orange-500" /> Shop Analytics
        </h1>
        <p className="text-gray-400 font-medium mb-8 relative z-10">Live business intelligence — understand your shop's performance at a glance.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-50 pt-6 relative z-10">
          {[
            { label: "Lifetime Revenue", value: `₹${Number(analytics?.totalRevenue||0).toLocaleString('en-IN')}`, color: "text-gray-900", Icon: DollarSign, bg: "bg-orange-50", ic: "text-orange-500" },
            { label: "Gross Print Jobs", value: analytics?.totalOrders || 0, color: "text-gray-900", Icon: ShoppingBag, bg: "bg-blue-50", ic: "text-blue-500" },
            { label: "This Month", value: `₹${Number(analytics?.monthlyRevenue||0).toLocaleString('en-IN')}`, color: "text-green-600", Icon: TrendingUp, bg: "bg-green-50", ic: "text-green-500" },
            { label: "This Week", value: `₹${Number(analytics?.weeklyRevenue||0).toLocaleString('en-IN')}`, color: "text-orange-600", Icon: Activity, bg: "bg-orange-50", ic: "text-orange-500" },
          ].map(({ label, value, color, Icon, bg, ic }, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`h-12 w-12 ${bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon className={`h-6 w-6 ${ic}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 2: TOP SERVICES + AREA REACH ── */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Top Services */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-1">
            <Printer className="h-5 w-5 text-purple-500 bg-purple-50 rounded-md p-0.5" /> Bestselling Services
          </h3>
          <p className="text-xs text-gray-400 mb-6">Ranked by completed order revenue</p>
          <div className="space-y-5">
            {analytics?.topServices?.length > 0 ? analytics.topServices.map((s, i) => {
              const pct = Math.max((s.revenue / maxServiceRevenue) * 100, 2);
              return (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-1.5">
                    <div>
                      <p className="font-bold text-sm text-gray-900 uppercase tracking-wide group-hover:text-purple-600 transition-colors">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.count} order{s.count !== 1 ? "s" : ""}</p>
                    </div>
                    <span className="text-sm font-black text-gray-900">₹{s.revenue.toFixed(0)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : (
              <div className="py-12 text-center text-gray-400 italic text-sm">No completed orders yet to rank services.</div>
            )}
          </div>
        </div>

        {/* Area Reach */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-1">
            <MapPin className="h-5 w-5 text-blue-500 bg-blue-50 rounded-md p-0.5" /> Customer Reach by Area
          </h3>
          <p className="text-xs text-gray-400 mb-6">Where your delivery orders originate from</p>
          <div className="space-y-5">
            {analytics?.ordersByArea?.length > 0 ? analytics.ordersByArea.map((loc, i) => {
              const pct = Math.max((loc.count / maxAreaCount) * 100, 3);
              const isPickup = loc.area === "In-Store Pickup";
              return (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-1.5">
                    <p className="font-bold text-sm capitalize text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      {isPickup ? <ShoppingBag className="h-3.5 w-3.5 text-gray-400" /> : <MapPin className="h-3.5 w-3.5 text-blue-400" />}
                      {loc.area}
                    </p>
                    <span className="text-xs font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{loc.count} job{loc.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${isPickup ? "bg-gray-400" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : (
              <div className="py-12 text-center text-gray-400 italic text-sm">No delivery data available. Area breakdown appears once customers choose delivery.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── 6-MONTH REVENUE CHART ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-1">
          <Activity className="h-5 w-5 text-orange-500 bg-orange-50 rounded-md p-0.5" /> 6-Month Revenue Trend
        </h3>
        <p className="text-xs text-gray-400 mb-10">Monthly completed order revenue over last 6 months</p>

        {analytics?.revenueTrend?.length > 0 ? (
          <div className="h-56 flex items-end justify-between gap-4 px-4 max-w-4xl mx-auto">
            {analytics.revenueTrend.map((dp, i) => {
              const h = Math.max((dp.earned / maxRevenueTrend) * 100, 2);
              return (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <div className="mb-2 flex justify-center">
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-sm">
                      ₹{dp.earned.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full max-w-[72px] bg-gray-50 rounded-t-2xl overflow-hidden flex-1 flex flex-col justify-end">
                    <div className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-2xl transition-all duration-1000" style={{ height: `${h}%` }} />
                  </div>
                  <div className="mt-3 text-xs font-bold text-gray-500 uppercase tracking-widest">{dp.month}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-56 flex items-center justify-center text-gray-400 italic">No historical data yet.</div>
        )}
      </div>

      {/* ── OFFERS & DISCOUNTS MANAGER ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Tag className="h-5 w-5 text-green-500 bg-green-50 rounded-md p-0.5" /> Offers & Discounts
          </h3>
          <button
            onClick={() => { setShowDiscountForm(v => !v); setFormError(""); setFormSuccess(""); }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            {showDiscountForm ? <><ChevronUp className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New Offer</>}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-6">Create time-bound discount offers on specific services to boost orders in slow periods.</p>

        {/* Create Form */}
        {showDiscountForm && (
          <form onSubmit={handleCreateDiscount} className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Tag className="h-4 w-4 text-green-600" /> Configure New Offer</h4>
            {formError && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl mb-4">{formError}</div>}
            {formSuccess && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-xl mb-4">{formSuccess}</div>}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Service</label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm"
                  value={discountForm.serviceId}
                  onChange={e => setDiscountForm({ ...discountForm, serviceId: e.target.value })}
                >
                  <option value="">— Select a service —</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.serviceName} (₹{Number(s.price).toFixed(2)})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Discount %</label>
                <input
                  type="number" required min="1" max="100" step="0.01"
                  placeholder="e.g. 15"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  value={discountForm.discountPercentage}
                  onChange={e => setDiscountForm({ ...discountForm, discountPercentage: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Min. Quantity</label>
                <input
                  type="number" min="1"
                  placeholder="1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  value={discountForm.minQuantity}
                  onChange={e => setDiscountForm({ ...discountForm, minQuantity: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Start Date</label>
                <input
                  type="date" min={today}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  value={discountForm.startDate}
                  onChange={e => setDiscountForm({ ...discountForm, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> End Date</label>
                <input
                  type="date" min={discountForm.startDate || today}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  value={discountForm.endDate}
                  onChange={e => setDiscountForm({ ...discountForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-green-200">
                Launch Offer
              </button>
            </div>
          </form>
        )}

        {/* Discounts List */}
        {discounts.length === 0 ? (
          <div className="py-12 text-center text-gray-400 italic text-sm border-2 border-dashed border-gray-100 rounded-2xl">
            No offers created yet. Create one to incentivise more orders!
          </div>
        ) : (
          <div className="space-y-3">
            {discounts.map((disc) => {
              const live = isActive(disc);
              const expired = disc.endDate && isExpired(disc.endDate);
              return (
                <div key={disc.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 rounded-2xl border transition-all ${live ? "border-green-100 bg-green-50/50" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{disc.service?.serviceName || "Service"}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${live ? "bg-green-100 text-green-700" : expired ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                        {live ? "● Live" : expired ? "Expired" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                      <span className="font-black text-lg text-green-600">{Number(disc.discountPercentage).toFixed(0)}% OFF</span>
                      <span>Min. qty: <strong>{disc.minQuantity}</strong></span>
                      {disc.startDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(disc.startDate)} → {formatDate(disc.endDate)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(disc.id)}
                      className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all ${disc.isActive ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                      {disc.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {disc.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(disc.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ShopAnalytics;
