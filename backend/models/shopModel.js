import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const shopModel = sequelize.define(
  "Shop",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // table name
        key: "id",
      },
    },
    shopName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Adding address to match frontend ShopDashboard.jsx
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Detailed Address
    addressNo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // The full address for fallback or easy string
    fullAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Contact Info
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Geospatial & Display
    directions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Hours (Store Hours in JSON format: { monday: "9am-5pm", tuesday: ... })
    storeHours: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // Stats for Display
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    queueType: {
      type: DataTypes.ENUM("FIFO", "SJF", "MANUAL"),
      defaultValue: "FIFO",
    },
  },
  {
    tableName: "shops",
    timestamps: true,
  }
);

export default shopModel;
