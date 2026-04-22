import { Order, DeliveryPerson, Shop, User } from "../models/index.js";
import { sendOrderCompletedEmail } from "../services/emailService.js";

// Helper for finding distance between two lat/lng pairs in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export const getDeliveryProfile = async (req, res) => {
  try {
    let profile = await DeliveryPerson.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await DeliveryPerson.create({ userId: req.user.id });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeliveryProfile = async (req, res) => {
  try {
    const { doorNo, street, city, pincode, isOnline, currentLatitude, currentLongitude } = req.body;
    let profile = await DeliveryPerson.findOne({ where: { userId: req.user.id } });
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (doorNo !== undefined) profile.doorNo = doorNo;
    if (street !== undefined) profile.street = street;
    if (city !== undefined) profile.city = city;
    if (pincode !== undefined) profile.pincode = pincode;
    if (isOnline !== undefined) profile.isOnline = isOnline;
    if (currentLatitude !== undefined) profile.currentLatitude = currentLatitude;
    if (currentLongitude !== undefined) profile.currentLongitude = currentLongitude;

    await profile.save();
    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, isOnline } = req.body;
    
    // Using update for performance
    await DeliveryPerson.update(
      { currentLatitude: latitude, currentLongitude: longitude, isOnline },
      { where: { userId: req.user.id } }
    );
    res.status(200).json({ message: "Location updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyOrders = async (req, res) => {
  try {
    const profile = await DeliveryPerson.findOne({ where: { userId: req.user.id } });
    if (!profile || !profile.currentLatitude || !profile.currentLongitude) {
      return res.status(400).json({ message: "Please update your location first" });
    }

    // Try up to 15km if nothing is found (5, 10, 15)
    let maxDistance = parseFloat(req.query.radius) || 5; 

    // Find all unassigned delivery orders
    const orders = await Order.findAll({
      where: {
        deliveryType: "delivery",
        deliveryStatus: "pending",
      },
      include: [
        { model: Shop, as: "shop", attributes: ["shopName", "latitude", "longitude", "fullAddress"] }
      ]
    });

    // Filter by distance
    const nearbyOrders = orders.filter((order) => {
      // fallback for shops missing coordinates during testing
      let shopLat = order.shop?.latitude;
      let shopLng = order.shop?.longitude;
      
      if (!shopLat || !shopLng) {
        shopLat = 13.0827; // default to a central coordinate for testing
        shopLng = 80.2707;
      }

      const dist = calculateDistance(
        profile.currentLatitude,
        profile.currentLongitude,
        shopLat,
        shopLng
      );
      // Include estimated distance and time on the object
      order.dataValues.pickupDistanceKm = dist.toFixed(2);
      return dist <= maxDistance;
    });

    res.status(200).json({ orders: nearbyOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await DeliveryPerson.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Use a transaction or optimistic locking. Simplest is finding specific status
    const [updatedRows] = await Order.update(
      { deliveryStatus: "assigned", deliveryPersonId: req.user.id },
      { where: { id: id, deliveryStatus: "pending" } }
    );

    if (updatedRows === 0) {
      // Order might have been accepted by someone else
      return res.status(400).json({ message: "Order is already accepted by another delivery person or not available" });
    }

    res.status(200).json({ message: "Order accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDeliveries = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { deliveryPersonId: req.user.id },
      include: [
        { model: Shop, as: "shop", attributes: ["shopName", "fullAddress", "phone"] },
        { model: User, as: "user", attributes: ["name", "mobile"] }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // picked_up, delivered
    
    // Only the assigned person can update
    const [updatedRows] = await Order.update(
      { deliveryStatus: status },
      { where: { id: id, deliveryPersonId: req.user.id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    res.status(200).json({ message: `Delivery status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const order = await Order.findOne({ where: { id, deliveryPersonId: req.user.id } });
    if (!order) return res.status(404).json({ message: "Order not found or unauthorized" });

    if (order.pickupOtp !== otp) {
      return res.status(400).json({ message: "Invalid Pickup OTP" });
    }

    order.deliveryStatus = "picked_up";
    await order.save();

    res.status(200).json({ message: "Pickup verified successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const order = await Order.findOne({ where: { id, deliveryPersonId: req.user.id } });
    if (!order) return res.status(404).json({ message: "Order not found or unauthorized" });

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ message: "Invalid Delivery OTP" });
    }

    order.deliveryStatus = "delivered";
    order.status = "completed"; // Mark overall order as completed
    await order.save();

    // ✅ NOTIFY USER
    const user = await User.findByPk(order.userId);
    const shop = await Shop.findByPk(order.shopId);
    if (user && shop) {
      await sendOrderCompletedEmail(user.email, order.id, shop.shopName);
    }

    res.status(200).json({ message: "Delivery verified successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
