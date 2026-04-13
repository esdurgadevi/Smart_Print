import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ServiceInventory = sequelize.define("ServiceInventory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  inventoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantityPerUnit: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0, // Quantity of inventory item consumed per 1 unit of service (or per page)
  },
});

export default ServiceInventory;
