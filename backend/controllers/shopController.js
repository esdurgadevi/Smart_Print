import { Shop, Service } from "../models/index.js";
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
      storeHours
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
      storeHours
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
      include: [{ model: Service, as: "services" }],
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
      storeHours, isActive
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

    res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error: error.message });
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
          include: [[distanceLiteral, "distance_km"]],
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
      include: [{ model: Service, as: "services", where: { isActive: true }, required: false }],
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json({ shop });
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop details", error: error.message });
  }
};
