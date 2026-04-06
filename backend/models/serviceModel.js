import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const serviceModel = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "shops", // table name
        key: "id",
      },
      onDelete: "CASCADE",
    },
    serviceName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "services",
    timestamps: true,
  }
);

export default serviceModel;
