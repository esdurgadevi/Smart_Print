import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createDiscount, getShopDiscounts, toggleDiscount, deleteDiscount } from "../controllers/discountController.js";
import { Discount, Service } from "../models/index.js";

const router = express.Router();

// Public: fetch active discounts for a specific shop (for user-facing display)
router.get("/public/:shopId", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const discounts = await Discount.findAll({
      where: { shopId: req.params.shopId, isActive: true },
      include: [{ model: Service, as: "service", attributes: ["serviceName", "price"] }],
    });
    // filter by date range on JS side
    const active = discounts.filter(d =>
      (!d.startDate || d.startDate <= today) && (!d.endDate || d.endDate >= today)
    );
    res.status(200).json({ discounts: active });
  } catch (error) {
    res.status(500).json({ message: "Failed", error: error.message });
  }
});

// Protected shop admin routes
router.get("/", protect, getShopDiscounts);
router.post("/", protect, createDiscount);
router.patch("/:id/toggle", protect, toggleDiscount);
router.delete("/:id", protect, deleteDiscount);

export default router;
