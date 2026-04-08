import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getDeliveryProfile,
  updateDeliveryProfile,
  updateLocation,
  getNearbyOrders,
  acceptOrder,
  getMyDeliveries,
  updateDeliveryStatus,
  verifyPickup,
  verifyDelivery,
} from "../controllers/deliveryController.js";

const router = express.Router();

// All routes require user to be logged in and have DELIVERY_PERSON role
router.use(protect);
router.use(authorizeRoles("DELIVERY_PERSON"));

router.get("/profile", getDeliveryProfile);
router.put("/profile", updateDeliveryProfile);
router.put("/location", updateLocation);
router.get("/orders/nearby", getNearbyOrders);
router.post("/orders/:id/accept", acceptOrder);
router.get("/orders/my-deliveries", getMyDeliveries);
router.put("/orders/:id/status", updateDeliveryStatus);
router.post("/orders/:id/verify-pickup", verifyPickup);
router.post("/orders/:id/verify-delivery", verifyDelivery);

export default router;