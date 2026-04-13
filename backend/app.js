import express from "express";
import dotenv from "dotenv";

dotenv.config();
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./routes/orderRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import cors from "cors";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/admin", superAdminRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/inventory", inventoryRoutes);

export default app;
