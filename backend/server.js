import app from "./app.js";
import sequelize from "./config/db.js";
import { User, Shop, Service, Order, Feedback, Discount, DeliveryPerson, Inventory, ServiceInventory } from "./models/index.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true }); // create tables if not exist, alter if structure changes
    console.log("✅ Tables synced - User table ready");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
};


startServer();
