import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Users, Store, TrendingUp, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, change: "+15%" },
    { label: "Print Shops", value: "45", icon: Store, change: "+5" },
    { label: "Total Orders", value: "2,345", icon: TrendingUp, change: "+28%" },
    { label: "Revenue", value: "₹45,890", icon: DollarSign, change: "+32%" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="h-8 w-8 text-orange-500" />
              <div className="text-right">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.change && <p className="text-sm text-green-600">{stat.change}</p>}
              </div>
            </div>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-center py-8">No recent users</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Recent Shops</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-center py-8">No recent shops</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;