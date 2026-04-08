import { Order, Shop, User, Service } from "../models/index.js";
import fs from "fs";
import { sendOrderCompletedEmail } from "../services/emailService.js";
import { PDFDocument } from "pdf-lib";
import { DeliveryPerson } from "../models/index.js";
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document provided" });
    }

    const { mimetype, path, filename } = req.file;

    // Detect pages for PDF
    let pageCount = 0;
    if (mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(path);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      pageCount = pdfDoc.getPageCount();
    }

    res.status(200).json({
      message: "Uploaded successfully",
      documentUrl: `/uploads/${filename}`,
      pageCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload document", error: error.message });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { shopId, serviceId, documentUrl, pageCount, pageRange, copies, totalAmount, deliveryType, deliveryAddress, deliveryLatitude, deliveryLongitude } = req.body;

    if (!shopId || !serviceId || !totalAmount) {
      return res.status(400).json({ message: "Missing essential order fields" });
    }

    const newOrder = await Order.create({
      userId: req.user.id,
      shopId,
      serviceId,
      documentUrl,
      pageCount,
      pageRange,
      copies: copies || 1,
      totalAmount,
      deliveryType: deliveryType || "pickup",
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      deliveryStatus: deliveryType === "delivery" ? "pending" : null,
    });
    // ===== AUTO ASSIGN DELIVERY PERSON =====
    if (deliveryType === "delivery") {
      const deliveryPersons = await DeliveryPerson.findAll({
        where: { isOnline: true }
      });

      let assigned = false;

      // 1️⃣ Try nearby (within 5km)
      for (let dp of deliveryPersons) {
        if (dp.currentLatitude && dp.currentLongitude) {
          const distance = calculateDistance(
            deliveryLatitude,
            deliveryLongitude,
            dp.currentLatitude,
            dp.currentLongitude
          );

          if (distance <= 5) {
            await newOrder.update({
              deliveryPersonId: dp.userId,
              deliveryStatus: "assigned"
            });
            assigned = true;
            break;
          }
        }
      }

      // 2️⃣ If no nearby → assign anyone
      if (!assigned && deliveryPersons.length > 0) {
        const randomDP =
          deliveryPersons[Math.floor(Math.random() * deliveryPersons.length)];

        await newOrder.update({
          deliveryPersonId: randomDP.userId,
          deliveryStatus: "assigned"
        });
      }
    }

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: ["shop", "service"],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

export const placeBatchOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided for batch order" });
    }

    const createdOrders = [];
    for (let item of items) {
      const newOrder = await Order.create({
        userId: req.user.id,
        shopId: item.shopId,
        serviceId: item.serviceId,
        documentUrl: item.documentUrl,
        pageCount: item.pageCount,
        pageRange: item.pageRange,
        copies: item.copies || 1,
        totalAmount: item.totalAmount,
        deliveryType: item.deliveryType || "pickup",
        deliveryAddress: item.deliveryAddress,
        deliveryLatitude: item.deliveryLatitude,
        deliveryLongitude: item.deliveryLongitude,
        deliveryStatus: item.deliveryType === "delivery" ? "pending" : null,
        pickupOtp: item.deliveryType === "delivery" ? generateOtp() : null,
        deliveryOtp: item.deliveryType === "delivery" ? generateOtp() : null,
      });
      createdOrders.push(newOrder);
    }

    res.status(201).json({ message: "Batch Order placed successfully", orders: createdOrders });
  } catch (error) {
    res.status(500).json({ message: "Failed to place batch order", error: error.message });
  }
};

// ====== SHOP ADMIN ENDPOINTS ======

export const getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const orders = await Order.findAll({
      where: { shopId: shop.id },
      include: ["user", "service"],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shop orders", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id, { include: ["user"] });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop || order.shopId !== shop.id) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    order.status = status;
    await order.save();

    // Trigger notification email if completed
    if (status === "completed" && order.user && order.user.email) {
      sendOrderCompletedEmail(order.user.email, order.id, shop.shopName);
    }

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
};

export const getLiveTracking = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ 
      where: { id, userId: req.user.id }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.deliveryPersonId || order.deliveryStatus === 'pending') {
       return res.status(400).json({ message: "Order not picked up by driver yet." });
    }

    const { DeliveryPerson } = await import("../models/index.js");
    const driver = await DeliveryPerson.findOne({ where: { userId: order.deliveryPersonId }});

    if (!driver) return res.status(404).json({ message: "Driver details not found" });

    res.status(200).json({
       driverLocation: {
          latitude: driver.currentLatitude,
          longitude: driver.currentLongitude
       },
       deliveryOtp: order.deliveryOtp
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tracking data", error: error.message });
  }
};
