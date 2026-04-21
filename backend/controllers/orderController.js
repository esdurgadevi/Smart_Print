import { Order, Shop, User, Service, Inventory, ServiceInventory } from "../models/index.js";
import { Op } from "sequelize";
import fs from "fs";
import { sendOrderCompletedEmail } from "../services/emailService.js";
import { PDFDocument } from "pdf-lib";
import sequelize from "../config/db.js";
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

    // Get shop to know queue type
    const shop = await Shop.findByPk(shopId);

    // Calculate initial queue position based on strategy
    const where = {
      shopId,
      status: { [Op.in]: ['pending', 'accepted'] }
    };

    if (shop?.queueType === 'SJF') {
      const myTotal = newOrder.pageCount * newOrder.copies;
      where[Op.or] = [
        sequelize.literal(`(pageCount * copies) < ${myTotal}`),
        {
          [Op.and]: [
            sequelize.literal(`(pageCount * copies) = ${myTotal}`),
            { createdAt: { [Op.lte]: newOrder.createdAt } }
          ]
        }
      ];
    } else if (shop?.queueType === 'MANUAL') {
      where[Op.or] = [
        { priority: { [Op.gt]: newOrder.priority } },
        { 
          [Op.and]: [
            { priority: newOrder.priority },
            { createdAt: { [Op.lte]: newOrder.createdAt } }
          ]
        }
      ];
    } else {
      where.createdAt = { [Op.lte]: newOrder.createdAt };
    }

    const queuePosition = await Order.count({ where });

    res.status(201).json({ message: "Order placed successfully", order: { ...newOrder.toJSON(), queuePosition } });
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

    const ordersWithPosition = await Promise.all(orders.map(async (order) => {
      const orderData = order.toJSON();
      if (['pending', 'accepted'].includes(order.status)) {
        const shop = order.shop; // Included in findAll
        const where = {
          shopId: order.shopId,
          status: { [Op.in]: ['pending', 'accepted'] }
        };

        if (shop?.queueType === 'SJF') {
          const myTotal = order.pageCount * order.copies;
          where[Op.or] = [
            sequelize.literal(`(pageCount * copies) < ${myTotal}`),
            {
              [Op.and]: [
                sequelize.literal(`(pageCount * copies) = ${myTotal}`),
                { createdAt: { [Op.lte]: order.createdAt } }
              ]
            }
          ];
        } else if (shop?.queueType === 'MANUAL') {
          where[Op.or] = [
            { priority: { [Op.gt]: order.priority } },
            { 
              [Op.and]: [
                { priority: order.priority },
                { createdAt: { [Op.lte]: order.createdAt } }
              ]
            }
          ];
        } else {
          where.createdAt = { [Op.lte]: order.createdAt };
        }

        const position = await Order.count({ where });
        orderData.queuePosition = position;
      }
      return orderData;
    }));

    res.status(200).json({ orders: ordersWithPosition });
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

export const updateOrderPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop || order.shopId !== shop.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await order.update({ priority });
    res.status(200).json({ message: "Priority updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update priority", error: error.message });
  }
};

export const getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    let orderClause = [];
    if (shop.queueType === 'SJF') {
      orderClause = [
        [sequelize.literal('pageCount * copies'), 'ASC'],
        ['createdAt', 'ASC']
      ];
    } else if (shop.queueType === 'MANUAL') {
      orderClause = [
        ['priority', 'DESC'],
        ['createdAt', 'ASC']
      ];
    } else {
      orderClause = [['createdAt', 'ASC']];
    }

    const orders = await Order.findAll({
      where: { shopId: shop.id },
      include: ["user", "service"],
      order: orderClause,
    });
    res.status(200).json({ orders, queueType: shop.queueType });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shop orders", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id, {
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    const shop = await Shop.findOne({
      where: { adminId: req.user.id },
      transaction
    });

    if (!shop || order.shopId !== shop.id) {
      await transaction.rollback();
      return res.status(403).json({ message: "Not authorized" });
    }

    console.log("OLD STATUS:", order.status);
    console.log("NEW STATUS:", status);

    // ✅ FORCE RUN (remove double-check issue)
    if (status === "completed") {

      const inventoryLinks = await ServiceInventory.findAll({
        where: { serviceId: order.serviceId },
        transaction
      });

      console.log("Inventory Links:", inventoryLinks.length);

      for (const link of inventoryLinks) {

        const item = await Inventory.findByPk(link.inventoryId, { transaction });

        if (!item) continue;

        // ✅ CORRECT MULTIPLIER
        let multiplier = 1;

        if (order.pageCount && order.pageCount > 0) {
          multiplier = order.pageCount * order.copies;
        } else {
          multiplier = order.copies;
        }

        const totalConsumption = link.quantityPerUnit * multiplier;

        console.log(`Reducing ${item.productName}`);
        console.log("Stock Before:", item.stockCount);
        console.log("Consumption:", totalConsumption);

        if (item.stockCount < totalConsumption) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Insufficient stock for ${item.productName}`
          });
        }

        await item.decrement("stockCount", {
          by: totalConsumption,
          transaction
        });

        console.log("Stock Reduced");
      }
    }

    order.status = status;
    await order.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Order updated successfully",
      order
    });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: "Failed",
      error: error.message
    });
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
    const driver = await DeliveryPerson.findOne({ where: { userId: order.deliveryPersonId } });

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
