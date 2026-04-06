import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const orderModel = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "shops",
        key: "id",
      },
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "services",
        key: "id",
      },
    },
    documentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    pageRange: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected", "completed"),
      defaultValue: "pending",},isReviewed: {type: DataTypes.BOOLEAN,defaultValue: false,},},
  {
    tableName: "orders",
    timestamps: true,
  }
);

export default orderModel;

