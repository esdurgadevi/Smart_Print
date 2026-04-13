import { Shop, Service, Discount } from "../models/index.js";

// 1. Create a Discount Offer
export const createDiscount = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const { serviceId, minQuantity, discountPercentage, startDate, endDate } = req.body;

    // Verify service belongs to this shop
    const service = await Service.findOne({ where: { id: serviceId, shopId: shop.id } });
    if (!service) return res.status(404).json({ message: "Service not found" });

    const discount = await Discount.create({
      shopId: shop.id,
      serviceId,
      minQuantity: minQuantity || 1,
      discountPercentage,
      startDate: startDate || null,
      endDate: endDate || null,
      isActive: true,
    });

    res.status(201).json({ message: "Discount created successfully", discount });
  } catch (error) {
    res.status(500).json({ message: "Failed to create discount", error: error.message });
  }
};

// 2. Get All Discounts for this Shop
export const getShopDiscounts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const discounts = await Discount.findAll({
      where: { shopId: shop.id },
      include: [{ model: Service, as: "service", attributes: ["serviceName", "price"] }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ discounts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch discounts", error: error.message });
  }
};

// 3. Toggle Discount active/inactive
export const toggleDiscount = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const discount = await Discount.findOne({ where: { id: req.params.id, shopId: shop.id } });
    if (!discount) return res.status(404).json({ message: "Discount not found" });

    discount.isActive = !discount.isActive;
    await discount.save();

    res.status(200).json({ message: `Discount ${discount.isActive ? "activated" : "deactivated"}`, discount });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle discount", error: error.message });
  }
};

// 4. Delete a Discount
export const deleteDiscount = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { adminId: req.user.id } });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const discount = await Discount.findOne({ where: { id: req.params.id, shopId: shop.id } });
    if (!discount) return res.status(404).json({ message: "Discount not found" });

    await discount.destroy();
    res.status(200).json({ message: "Discount deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete discount", error: error.message });
  }
};
