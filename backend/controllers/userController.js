import { User, Order } from "../models/index.js";
import { Op } from "sequelize";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "refreshToken", "otp", "otpExpiry"] }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Analytics: Orders
    const orders = await Order.findAll({
      where: { userId: req.user.id, status: "completed" }
    });

    const totalOrders = orders.length;
    let totalSpent = 0;
    let monthlySpent = 0;
    let weeklySpent = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Initialize 6-month array
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sixMonthSeries = [];
    for (let i = 5; i >= 0; i--) {
       let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
       sixMonthSeries.push({ month: monthNames[d.getMonth()], spent: 0, year: d.getFullYear(), monthInt: d.getMonth() });
    }

    orders.forEach(order => {
      const amt = Number(order.totalAmount) || 0;
      totalSpent += amt;

      const orderDate = new Date(order.createdAt);
      
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        monthlySpent += amt;
      }
      if (orderDate >= startOfWeek) {
        weeklySpent += amt;
      }

      // Check if order belongs in the past 6 months
      const diffMonths = (now.getFullYear() - orderDate.getFullYear()) * 12 + (now.getMonth() - orderDate.getMonth());
      if (diffMonths >= 0 && diffMonths <= 5) {
         // find the bucket
         const bucket = sixMonthSeries.find(b => b.monthInt === orderDate.getMonth() && b.year === orderDate.getFullYear());
         if (bucket) {
            bucket.spent += amt;
         }
      }
    });

    res.status(200).json({
      user,
      analytics: {
        totalOrders,
        totalSpent,
        monthlySpent,
        weeklySpent,
        spendingTrend: sixMonthSeries
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    
    await user.save();

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};
