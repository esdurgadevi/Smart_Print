import { Order, Shop, User, Service, Inventory, ServiceInventory } from "../models/index.js";
import { Op } from "sequelize";
import fs from "fs";
import { sendOrderCompletedEmail } from "../services/emailService.js";
import { PDFDocument, PDFName } from "pdf-lib";
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

const parsePageRange = (rangeStr, totalPages) => {
  if (!rangeStr || rangeStr.toLowerCase() === "all" || rangeStr.trim() === "") {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const pages = new Set();
  rangeStr.split(",").forEach((part) => {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((n) => parseInt(n.trim()));
      for (let i = start; i <= end; i++) {
        if (!isNaN(i)) pages.add(i - 1);
      }
    } else {
      const num = parseInt(part.trim());
      if (!isNaN(num)) pages.add(num - 1);
    }
  });
  return Array.from(pages)
    .sort((a, b) => a - b)
    .filter((p) => p >= 0 && p < totalPages);
};

const detectColorPages = async (buffer) => {
  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const colorPageIndices = [];
    const decoder = new TextDecoder();
    const num = "[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?";

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      let hasColor = false;

      // 1️⃣ RESOLVE INHERITED RESOURCES
      let res = page.node.Resources();
      if (!res) {
        let current = page.node;
        while (current && !res) {
          res = current.get(PDFName.of("Resources"));
          if (res) break;
          const parentRef = current.get(PDFName.of("Parent"));
          if (!parentRef) break;
          current = pdfDoc.context.lookup(parentRef);
        }
      }

      if (res) {
        const resourceDict = pdfDoc.context.lookup(res);
        const getVal = (obj, key) => {
          if (!obj) return undefined;
          if (typeof obj.get === "function") return obj.get(PDFName.of(key));
          if (obj.dict && typeof obj.dict.get === "function") return obj.dict.get(PDFName.of(key));
          return undefined;
        };

        // 2️⃣ SCAN IMAGES (XOBJECTS)
        // Only trigger if image is actually using color
        const xObject = getVal(resourceDict, "XObject");
        if (xObject) {
          const xObjectMap = pdfDoc.context.lookup(xObject);
          if (xObjectMap && typeof xObjectMap.entries === "function") {
            for (const [name, objRef] of xObjectMap.entries()) {
              const obj = pdfDoc.context.lookup(objRef);
              if (obj && getVal(obj, "Subtype")?.toString() === "/Image") {
                const xcs = getVal(obj, "ColorSpace");
                if (xcs) {
                  const xcsResolved = pdfDoc.context.lookup(xcs);
                  const xcsStr = xcsResolved.toString().toUpperCase();
                  // Ignore DeviceGray and indexed/masked grayscale attempts
                  if (xcsStr.includes("RGB") || xcsStr.includes("CMYK") || xcsStr.includes("ICCBASED") || xcsStr.includes("CALRGB")) {
                    hasColor = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }

      // 3️⃣ DEEP STREAM SCAN (LAST RESORT)
      if (!hasColor) {
        try {
          const streams = page.getContentStreams();
          for (const stream of streams) {
            const streamObj = pdfDoc.context.lookup(stream);
            if (streamObj && typeof streamObj.decode === "function") {
              const decoded = streamObj.decode();
              if (!decoded) continue;
              const text = decoder.decode(decoded);

              // RGB Scanner - check sensitivity threshold
              const rgbRegex = new RegExp(`(${num})\\s+(${num})\\s+(${num})\\s+R?G`, "gi");
              let match;
              while ((match = rgbRegex.exec(text)) !== null) {
                const r = parseFloat(match[1]);
                const g = parseFloat(match[2]);
                const b = parseFloat(match[3]);
                // Text might be 'near black' (e.g. 0.01 0.01 0.01) - ignore it
                if (Math.abs(r - g) > 0.05 || Math.abs(g - b) > 0.05 || Math.abs(r - b) > 0.05) {
                  hasColor = true;
                  break;
                }
              }
              if (hasColor) break;

              // CMYK Scanner
              const cmykRegex = new RegExp(`(${num})\\s+(${num})\\s+(${num})\\s+(${num})\\s+k`, "gi");
              while ((match = cmykRegex.exec(text)) !== null) {
                const c = parseFloat(match[1]);
                const m = parseFloat(match[2]);
                const y = parseFloat(match[3]);
                if (c > 0.05 || m > 0.05 || y > 0.05) {
                  hasColor = true;
                  break;
                }
              }
              if (hasColor) break;
            }
          }
        } catch (e) {
          // Silent fail on malformed streams
        }
      }

      if (hasColor) colorPageIndices.push(i + 1);
    }

    if (colorPageIndices.length === 0) return "";
    
    let ranges = [];
    if (colorPageIndices.length > 0) {
      let start = colorPageIndices[0];
      let end = start;
      for (let i = 1; i <= colorPageIndices.length; i++) {
        if (i < colorPageIndices.length && colorPageIndices[i] === end + 1) {
          end = colorPageIndices[i];
        } else {
          ranges.push(start === end ? `${start}` : `${start}-${end}`);
          if (i < colorPageIndices.length) {
            start = colorPageIndices[i];
            end = start;
          }
        }
      }
    }
    return ranges.join(", ");
  } catch (err) {
    console.error("Critical Detection Error:", err);
    return "";
  }
};

const splitPdfIfNeeded = async (documentUrl, pageRange, pageCount) => {
  if (documentUrl && pageRange && pageRange.trim() !== "" && pageRange.toLowerCase() !== "all") {
    try {
      const originalPath = `.${documentUrl}`;
      if (fs.existsSync(originalPath)) {
        const uint8Array = fs.readFileSync(originalPath);
        const pdfDoc = await PDFDocument.load(uint8Array);
        const totalPagesInPdf = pdfDoc.getPageCount();

        const pagesToExtract = parsePageRange(pageRange, totalPagesInPdf);

        if (pagesToExtract.length > 0 && pagesToExtract.length < totalPagesInPdf) {
          const newPdfDoc = await PDFDocument.create();
          const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToExtract);
          copiedPages.forEach((page) => newPdfDoc.addPage(page));

          const pdfBytes = await newPdfDoc.save();
          const filename = `split-${Date.now()}-${Math.floor(Math.random() * 1000)}.pdf`;
          const newPath = `./uploads/${filename}`;
          fs.writeFileSync(newPath, pdfBytes);

          return {
            documentUrl: `/uploads/${filename}`,
            pageCount: pagesToExtract.length
          };
        }
      }
    } catch (err) {
      console.error("PDF Split Error:", err);
    }
  }
  return { documentUrl, pageCount };
};
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const assignDeliveryPerson = async (newOrder) => {
  if (newOrder.deliveryType !== "delivery") return false;

  const deliveryPersons = await DeliveryPerson.findAll({
    where: { isOnline: true },
  });

  let assigned = false;

  // 1️⃣ Try nearby (within 5km)
  for (let dp of deliveryPersons) {
    if (dp.currentLatitude && dp.currentLongitude) {
      const distance = calculateDistance(
        newOrder.deliveryLatitude,
        newOrder.deliveryLongitude,
        dp.currentLatitude,
        dp.currentLongitude
      );

      if (distance <= 5) {
        await newOrder.update({
          deliveryPersonId: dp.userId,
          deliveryStatus: "assigned",
        });
        assigned = true;
        break;
      }
    }
  }

  // 2️⃣ If no nearby → assign anyone
  if (!assigned && deliveryPersons.length > 0) {
    const randomDP = deliveryPersons[Math.floor(Math.random() * deliveryPersons.length)];

    await newOrder.update({
      deliveryPersonId: randomDP.userId,
      deliveryStatus: "assigned",
    });
    assigned = true;
  }

  return assigned;
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document provided" });
    }

    const { mimetype, path, filename } = req.file;

    // Detect pages for PDF
    let pageCount = 0;
    let autoColorPages = "";
    if (mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(path);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      pageCount = pdfDoc.getPageCount();
      
      // RUN COLOR DETECTION
      autoColorPages = await detectColorPages(dataBuffer);
    }

    res.status(200).json({
      message: "Uploaded successfully",
      documentUrl: `/uploads/${filename}`,
      pageCount,
      autoColorPages,
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

    // PHYSICAL PDF SPLITTING LOGIC
    const { documentUrl: finalDocumentUrl, pageCount: finalPageCount } = await splitPdfIfNeeded(documentUrl, pageRange, pageCount);

    const newOrder = await Order.create({
      userId: req.user.id,
      shopId,
      serviceId,
      documentUrl: finalDocumentUrl,
      pageCount: finalPageCount,
      pageRange,
      copies: copies || 1,
      totalAmount,
      deliveryType: deliveryType || "pickup",
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      deliveryStatus: deliveryType === "delivery" ? "pending" : null,
      pickupOtp: deliveryType === "delivery" ? generateOtp() : null,
      deliveryOtp: deliveryType === "delivery" ? generateOtp() : null,
      batchId: req.body.batchId,
      splitType: req.body.splitType,
    });

    // ===== AUTO ASSIGN DELIVERY PERSON =====
    await assignDeliveryPerson(newOrder);

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
    const batchId = `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    for (let item of items) {
      // FIRE PHYSICAL SPLIT IF NEEDED
      const { documentUrl: finalUrl, pageCount: finalCount } = await splitPdfIfNeeded(item.documentUrl, item.pageRange, item.pageCount);

      const newOrder = await Order.create({
        userId: req.user.id,
        shopId: item.shopId,
        serviceId: item.serviceId,
        documentUrl: finalUrl,
        pageCount: finalCount,
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
        batchId: batchId,
        splitType: item.splitType,
      });

      // AUTO ASSIGN
      await assignDeliveryPerson(newOrder);

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

    // ✅ NOTIFICATION LOGIC
    if (status === "completed") {
      const user = await User.findByPk(order.userId, { transaction });
      
      if (order.deliveryType === "delivery") {
        // Find assigned driver
        if (order.deliveryPersonId) {
          const driverUser = await User.findByPk(order.deliveryPersonId, { transaction });
          if (driverUser) {
            console.log(`[Notification] To Driver ${driverUser.name}: Order #${order.id} is ready for pickup at ${shop.shopName}`);
            // In real app: sendDeliveryReadyEmail(driverUser.email, order.id, shop.shopName);
          }
        }
      } else {
        // Standard pickup order -> Notify user
        if (user) {
          await sendOrderCompletedEmail(user.email, order.id, shop.shopName);
        }
      }
    }

    await transaction.commit();

    res.status(200).json({
      message: "Order updated successfully",
      order,
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
