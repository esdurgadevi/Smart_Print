import express from "express";
import { getPlatformAnalytics } from "../controllers/superAdminController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/analytics", protect, getPlatformAnalytics);

export default router;
