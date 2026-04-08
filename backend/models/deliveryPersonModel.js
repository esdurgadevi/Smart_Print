import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const deliveryPersonModel = sequelize.define(
  "DeliveryPerson",
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
    // Registration Address
    doorNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    street: {
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
    // Document Verification
    idProofUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    drivingLicenseUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Admin needs to verify the standard documents",
    },
    // Tracking during job time
    currentLatitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    currentLongitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Is currently accepting orders?",
    },
    // Stats
    totalDeliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "delivery_persons",
    timestamps: true,
  }
);

export default deliveryPersonModel;
