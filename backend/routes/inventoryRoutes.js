import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventoryController.js";

const router = express.Router();


// Apply protect individually (like feedback)
router.put("/:id", protect, updateInventoryItem);
router.delete("/:id", protect, deleteInventoryItem);
router.get("/", protect, getInventory);
router.post("/", protect, addInventoryItem);


export default router;