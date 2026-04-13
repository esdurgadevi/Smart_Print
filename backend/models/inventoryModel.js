import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Inventory = sequelize.define("Inventory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  shopId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
    // Dropdown choices: Paper, Board, Spiral, Visiting Card, Invite Card
  },
  stockCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  minStockAlertCount: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
});

export default Inventory;
