import { User, Shop, Order } from "../models/index.js";

export const getPlatformAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
       return res.status(403).json({ message: "Not authorized" });
    }

    const { count: totalUsers, rows: recentUsers } = await User.findAndCountAll({
       limit: 5,
       order: [["createdAt", "DESC"]]
    });

    const { count: totalShops, rows: recentShops } = await Shop.findAndCountAll({
       limit: 5,
       order: [["createdAt", "DESC"]]
    });

    const orders = await Order.findAll({
      where: { status: "completed" }
    });

    const totalOrders = orders.length;
    let totalPlatformRevenue = 0;

    const now = new Date();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sixMonthSeries = [];
    for (let i = 5; i >= 0; i--) {
       let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
       sixMonthSeries.push({ month: monthNames[d.getMonth()], earned: 0, year: d.getFullYear(), monthInt: d.getMonth() });
    }

    orders.forEach(order => {
      const amt = Number(order.totalAmount) || 0;
      totalPlatformRevenue += amt;

      const orderDate = new Date(order.createdAt);
      
      const diffMonths = (now.getFullYear() - orderDate.getFullYear()) * 12 + (now.getMonth() - orderDate.getMonth());
      if (diffMonths >= 0 && diffMonths <= 5) {
         const bucket = sixMonthSeries.find(b => b.monthInt === orderDate.getMonth() && b.year === orderDate.getFullYear());
         if (bucket) {
            bucket.earned += amt;
         }
      }
    });

    res.status(200).json({
      analytics: {
        totalUsers,
        totalShops,
        totalOrders,
        totalPlatformRevenue,
        revenueTrend: sixMonthSeries,
        recentUsers,
        recentShops
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch platform analytics", error: error.message });
  }
};
