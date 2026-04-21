import { Shop, Service, Order, ServiceInventory } from "../models/index.js";
import sequelize from "../config/db.js";

// ====== SHOP ADMIN ENDPOINTS ======

// 1. Create a Shop
export const createShop = async (req, res) => {
  try {
    if (req.user.role !== "SHOP_ADMIN") {
      return res.status(403).json({ message: "Only Shop Admins can create a shop" });
    }

    const {
      shopName, description, logoUrl, address,
      addressNo, street, location, city, pincode, fullAddress,
      phone, email, whatsapp,
      directions, latitude, longitude,
      storeHours, queueType
    } = req.body;

    // Check if user already has a shop
    const existingShop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (existingShop) {
      return res.status(400).json({ message: "You already have a shop registered" });
    }

    const newShop = await Shop.create({
      adminId: req.user.id,
      shopName,
      description,
      logoUrl,
      address,
      addressNo, street, location, city, pincode, fullAddress,
      phone, email, whatsapp,
      directions, latitude, longitude,
      storeHours, queueType
    });

    res.status(201).json({ message: "Shop created successfully", shop: newShop });
  } catch (error) {
    res.status(500).json({ message: "Error creating shop", error: error.message });
  }
};

// 2. Get My Shop (Dashboard)
export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({
      where: { adminId: req.user.id },
      include: [
        { 
          model: Service, 
          as: "services",
          include: [{ model: ServiceInventory, as: "inventoryLinks" }]
        }
      ],
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json({ shop });
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop", error: error.message });
  }
};

// 2.5 Update My Shop (Profile Edit)
export const updateShop = async (req, res) => {
  try {
    if (req.user.role !== "SHOP_ADMIN") {
      return res.status(403).json({ message: "Only Shop Admins can update a shop" });
    }

    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found. Please create one first." });
    }

    const {
      shopName, description, logoUrl, address,
      addressNo, street, location, city, pincode, fullAddress,
      phone, email, whatsapp,
      directions, latitude, longitude,
      storeHours, isActive, queueType
    } = req.body;

    await shop.update({
      shopName: shopName !== undefined ? shopName : shop.shopName,
      description: description !== undefined ? description : shop.description,
      logoUrl: logoUrl !== undefined ? logoUrl : shop.logoUrl,
      address: address !== undefined ? address : shop.address,
      addressNo: addressNo !== undefined ? addressNo : shop.addressNo,
      street: street !== undefined ? street : shop.street,
      location: location !== undefined ? location : shop.location,
      city: city !== undefined ? city : shop.city,
      pincode: pincode !== undefined ? pincode : shop.pincode,
      fullAddress: fullAddress !== undefined ? fullAddress : shop.fullAddress,
      phone: phone !== undefined ? phone : shop.phone,
      email: email !== undefined ? email : shop.email,
      whatsapp: whatsapp !== undefined ? whatsapp : shop.whatsapp,
      directions: directions !== undefined ? directions : shop.directions,
      latitude: latitude !== undefined ? latitude : shop.latitude,
      longitude: longitude !== undefined ? longitude : shop.longitude,
      storeHours: storeHours !== undefined ? storeHours : shop.storeHours,
      isActive: isActive !== undefined ? isActive : shop.isActive,
      queueType: queueType !== undefined ? queueType : shop.queueType,
    });

    res.status(200).json({ message: "Shop updated successfully", shop });
  } catch (error) {
    res.status(500).json({ message: "Error updating shop", error: error.message });
  }
};

// 3. Add a Service to My Shop
export const addService = async (req, res) => {
  try {
    const { serviceName, description, price, imageUrl } = req.body;

    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) {
      return res.status(404).json({ message: "Please create a shop first" });
    }

    const newService = await Service.create({
      shopId: shop.id,
      serviceName,
      description,
      price,
      imageUrl,
    });

    // Handle initial inventory linkage
    if (req.body.inventoryLinks && Array.isArray(req.body.inventoryLinks)) {
      const links = req.body.inventoryLinks.map(link => ({
        serviceId: newService.id,
        inventoryId: link.inventoryId,
        quantityPerUnit: link.quantityPerUnit
      }));
      await ServiceInventory.bulkCreate(links);
    }

    res.status(201).json({ message: "Service added successfully", service: newService });
  } catch (error) {
    res.status(500).json({ message: "Error adding service", error: error.message });
  }
};

// 3.5 Update a Service in My Shop
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName, description, price, imageUrl, isActive } = req.body;

    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) {
      return res.status(404).json({ message: "Please create a shop first" });
    }

    const service = await Service.findOne({ where: { id, shopId: shop.id } });
    if (!service) {
      return res.status(404).json({ message: "Service not found or unauthorized" });
    }

    await service.update({
      serviceName: serviceName !== undefined ? serviceName : service.serviceName,
      description: description !== undefined ? description : service.description,
      price: price !== undefined ? price : service.price,
      imageUrl: imageUrl !== undefined ? imageUrl : service.imageUrl,
      isActive: isActive !== undefined ? isActive : service.isActive,
    });

    // Sync inventory linkage
    if (req.body.inventoryLinks && Array.isArray(req.body.inventoryLinks)) {
      // Simplest way: Delete old and create new
      await ServiceInventory.destroy({ where: { serviceId: id } });
      const links = req.body.inventoryLinks.map(link => ({
        serviceId: id,
        inventoryId: link.inventoryId,
        quantityPerUnit: link.quantityPerUnit
      }));
      await ServiceInventory.bulkCreate(links);
    }

    res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error: error.message });
  }
};

// 3.8 Shop Analytics
export const getShopAnalytics = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const orders = await Order.findAll({
      where: { shopId: shop.id, status: "completed" },
      include: [{ model: Service, as: "service", attributes: ["serviceName"] }]
    });

    const totalOrders = orders.length;
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let weeklyRevenue = 0;

    const topServicesMap = {};
    const areaMap = {};

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sixMonthSeries = [];
    for (let i = 5; i >= 0; i--) {
      let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      sixMonthSeries.push({ month: monthNames[d.getMonth()], earned: 0, year: d.getFullYear(), monthInt: d.getMonth() });
    }

    orders.forEach(order => {
      const amt = Number(order.totalAmount) || 0;
      totalRevenue += amt;

      const orderDate = new Date(order.createdAt);
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        monthlyRevenue += amt;
      }
      if (orderDate >= startOfWeek) {
        weeklyRevenue += amt;
      }

      const diffMonths = (now.getFullYear() - orderDate.getFullYear()) * 12 + (now.getMonth() - orderDate.getMonth());
      if (diffMonths >= 0 && diffMonths <= 5) {
        const bucket = sixMonthSeries.find(b => b.monthInt === orderDate.getMonth() && b.year === orderDate.getFullYear());
        if (bucket) {
          bucket.earned += amt;
        }
      }

      // Top Services Mapping
      if (order.service) {
        const sName = order.service.serviceName || "Unknown";
        if (!topServicesMap[sName]) topServicesMap[sName] = { name: sName, count: 0, revenue: 0 };
        topServicesMap[sName].count += 1;
        topServicesMap[sName].revenue += amt;
      }

      // Geographical Area Mapping
      if (order.deliveryAddress) {
        let area = "Unknown";
        if (typeof order.deliveryAddress === 'string') {
          try {
            const parsed = JSON.parse(order.deliveryAddress);
            area = parsed.city || parsed.pincode || "Local";
          } catch (e) {
            area = order.deliveryAddress.substring(0, 20);
          }
        } else if (typeof order.deliveryAddress === 'object') {
          area = order.deliveryAddress.city || order.deliveryAddress.pincode || "Local";
        }

        if (area && area !== "Unknown") {
          if (!areaMap[area]) areaMap[area] = 0;
          areaMap[area] += 1;
        }
      } else {
        if (!areaMap["In-Store Pickup"]) areaMap["In-Store Pickup"] = 0;
        areaMap["In-Store Pickup"] += 1;
      }
    });

    const topServices = Object.values(topServicesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const ordersByArea = Object.entries(areaMap).map(([area, count]) => ({ area, count })).sort((a, b) => b.count - a.count).slice(0, 6);

    res.status(200).json({
      analytics: {
        totalOrders,
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        revenueTrend: sixMonthSeries,
        topServices,
        ordersByArea
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shop analytics", error: error.message });
  }
};

// ====== PUBLIC / USER ENDPOINTS ======

// 4. Get All Shops (with optional nearby calculation, filtering and sorting)
export const getAllShops = async (req, res) => {
  try {
    const { lat, lng, service, sort } = req.query;

    let shops;

    // Service include block configuration
    const serviceInclude = {
      model: Service,
      as: "services",
      where: { isActive: true },
      required: service ? true : false, // only require if a specific service is filtered
    };

    if (service) {
      serviceInclude.where.serviceName = service;
    }

    if (lat && lng) {
      // Calculate distance using Haversine formula
      // Radius of Earth = 6371 km
      const distanceLiteral = sequelize.literal(
        `6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))`
      );

      // default sorting by distance
      let orderClause = [[distanceLiteral, "ASC"]];

      if (sort === "cost_low") {
        orderClause = [[{ model: Service, as: "services" }, "price", "ASC"]];
      }

      shops = await Shop.findAll({
        where: { isActive: true },
        include: [serviceInclude],
        attributes: {
          include: [
            [distanceLiteral, "distance_km"],
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM orders AS o
                WHERE o.shopId = Shop.id
                AND o.status IN ('pending', 'accepted')
              )`),
              'queueCount'
            ]
          ]
        },
        order: orderClause,
      });
    } else {
      let orderClause = [];
      if (sort === "cost_low") {
        orderClause = [[{ model: Service, as: "services" }, "price", "ASC"]];
      }

      shops = await Shop.findAll({
        where: { isActive: true },
        include: [serviceInclude],
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM orders AS o
                WHERE o.shopId = Shop.id
                AND o.status IN ('pending', 'accepted')
              )`),
              'queueCount'
            ]
          ]
        },
        order: orderClause,
      });
    }

    res.status(200).json({ shops });
  } catch (error) {
    res.status(500).json({ message: "Error fetching shops", error: error.message });
  }
};

// 5. Get Specific Shop details with Services
export const getShopDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findOne({
      where: { id, isActive: true },
      include: [
        { 
          model: Service, 
          as: "services", 
          where: { isActive: true }, 
          required: false,
          include: [{ model: ServiceInventory, as: "inventoryLinks" }]
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM orders AS o
              WHERE o.shopId = Shop.id
              AND o.status IN ('pending', 'accepted')
            )`),
            'queueCount'
          ]
        ]
      },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json({ shop });
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop details", error: error.message });
  }
};
