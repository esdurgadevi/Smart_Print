import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Save, TrendingUp, ShoppingBag, CreditCard, Activity } from "lucide-react";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

const UserProfile = () => {
  const { user: authUser, login } = useAuth(); // We might need login to refresh context if required
  
  const [profile, setProfile] = useState({ name: "", mobile: "", email: "", createdAt: "" });
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, monthlySpent: 0, weeklySpent: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserProfileAndAnalytics();
      setProfile({
        name: data.user.name || "",
        mobile: data.user.mobile || "",
        email: data.user.email || "",
        createdAt: data.user.createdAt
      });
      setStats(data.analytics);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      const res = await userService.updateUserProfile({ name: profile.name, mobile: profile.mobile });
      setMessage("Profile updated successfully!");
      
      // Optionally update Auth context
      // login(res.user); 
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-8 w-8 text-orange-500" /> My Profile & Analytics
        </h1>
        <p className="text-gray-500 mt-1">Manage your account details and view your print activity.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Edit Profile */}
        <div className="lg:col-span-1 border border-gray-100 bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Account Details</h2>
          
          {message && (
            <div className={`p-4 mb-6 rounded-xl text-sm font-bold ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed rounded-xl"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
               <button
                 type="submit"
                 disabled={saving}
                 className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
               >
                 {saving ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : <><Save className="h-4 w-4" /> Save Changes</>}
               </button>
            </div>
          </form>

          <p className="text-xs text-gray-400 mt-6 text-center flex items-center justify-center gap-1">
             <Calendar className="h-3 w-3" /> Member since {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Right Column: Analytics */}
        <div className="lg:col-span-2 space-y-8">
           
           <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-lg shadow-orange-200 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-orange-100 font-bold tracking-wide uppercase text-sm mb-2 flex items-center gap-2"><CreditCard className="h-4 w-4"/> Lifetime Expenditure</h3>
                <div className="text-5xl font-black mb-1">₹{Number(stats.totalSpent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <p className="text-orange-100/80 font-medium">Total money spent on print services globally</p>
              </div>
              <TrendingUp className="absolute -bottom-6 -right-6 h-48 w-48 text-white opacity-10 transform -rotate-12" />
           </div>

           <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex items-start gap-4">
                 <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-6 w-6 text-blue-500" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-400 tracking-wide uppercase">Total Orders</p>
                    <p className="text-2xl font-black text-gray-900">{stats.totalOrders}</p>
                 </div>
              </div>

              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex items-start gap-4">
                 <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Activity className="h-6 w-6 text-green-500" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-400 tracking-wide uppercase">This Month</p>
                    <p className="text-2xl font-black text-gray-900">₹{Number(stats.monthlySpent).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                 </div>
              </div>

              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex items-start gap-4">
                 <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-400 tracking-wide uppercase">This Week</p>
                    <p className="text-2xl font-black text-gray-900">₹{Number(stats.weeklySpent).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8 text-gray-900 border-b border-gray-50 pb-4">
                 <h3 className="font-bold text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-orange-500" /> 6-Month Expenditure Trend</h3>
              </div>
              
              {stats.spendingTrend && stats.spendingTrend.length > 0 ? (
                <div className="h-48 flex items-end justify-between gap-2">
                  {stats.spendingTrend.map((dataPoint, idx) => {
                     // Calculate height percentage relative to max
                     const maxSpent = Math.max(...stats.spendingTrend.map(d => d.spent), 100); 
                     const heightPct = Math.max((dataPoint.spent / maxSpent) * 100, 5); // min 5% height so the bar is always visible
                     
                     return (
                       <div key={idx} className="flex flex-col items-center flex-1 group">
                         <div className="w-full flex justify-center mb-2">
                           <div className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                             ₹{dataPoint.spent.toFixed(0)}
                           </div>
                         </div>
                         <div className="w-full max-w-[40px] bg-gray-100 rounded-t-xl overflow-hidden relative flex-1 flex flex-col justify-end">
                            <div 
                              className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-xl transition-all duration-1000 ease-out" 
                              style={{ height: `${heightPct}%` }}
                            ></div>
                         </div>
                         <div className="mt-3 text-xs font-bold text-gray-500">
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
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
