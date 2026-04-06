import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadDocument, placeOrder, getMyOrders, placeBatchOrder, getShopOrders, updateOrderStatus } from "../controllers/orderController.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ====== USER ROUTES ======
router.get("/my-orders", protect, getMyOrders);
router.post("/upload", protect, upload.single('document'), uploadDocument);
router.post("/batch", protect, placeBatchOrder);
router.post("/", protect, placeOrder);

// ====== ADMIN ROUTES ======
router.get("/shop-orders", protect, getShopOrders);
router.put("/:id/status", protect, updateOrderStatus);

export default router;
