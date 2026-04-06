import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { addFeedback, getShopFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", protect, addFeedback);
router.get("/shop/:shopId", getShopFeedback);

export default router;
