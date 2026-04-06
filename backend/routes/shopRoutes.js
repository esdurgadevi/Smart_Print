import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createShop,
  updateShop,
  getMyShop,
  addService,
  updateService,
  getAllShops,
  getShopDetails,
} from "../controllers/shopController.js";

const router = express.Router();

// ====== SHOP ADMIN ROUTES ======
// Must be logged in, roles checked in controller
router.post("/", protect, createShop);
router.put("/", protect, updateShop);
router.get("/my-shop", protect, getMyShop);
router.post("/services", protect, addService);
router.put("/services/:id", protect, updateService);

// ====== PUBLIC / USER ROUTES ======
router.get("/", getAllShops); // Optional: protect this if only logged in users can see shops
router.get("/:id", getShopDetails);

export default router;
