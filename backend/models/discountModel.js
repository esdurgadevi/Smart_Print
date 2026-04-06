import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const discountModel = sequelize.define(
  "Discount",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "services",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "shops",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    minQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "discounts",
    timestamps: true,
  }
);

export default discountModel;
