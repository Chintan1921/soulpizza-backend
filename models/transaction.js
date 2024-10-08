const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user"); // Assuming you have a User model

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    user_id: {
     type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2), // 10 digits, 2 decimal places
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "usd", // Default currency is USD
    },
    status: {
      type: DataTypes.ENUM("pending", "succeeded", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending", // Default status is 'pending'
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true, // Optional field to store the payment method (e.g., 'card', 'paypal')
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true, // Optional field to describe the transaction
    },
    receipt_url: {
      type: DataTypes.STRING,
      allowNull: true, // URL for the payment receipt
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` columns automatically
    paranoid: true,   // Adds a `deletedAt` column for soft deletes
  }
);

// Associate Transaction with User
Transaction.belongsTo(User, { foreignKey: "user_id" });

module.exports = Transaction;
