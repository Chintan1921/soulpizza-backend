"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: "Users",
          },
          key: "id",
        },
        allowNull: true,
      },
      store_id: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: "Stores",
          },
          key: "id",
        },
        allowNull: false,
      },
      customer_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: Sequelize.DataTypes.ENUM("in-progress", "delivered"),
        allowNull: true,
      },
      type: {
        type: Sequelize.DataTypes.ENUM("delivery", "pickup"),
        allowNull: true,
      },
      pickup_time: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      tax: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: true,
      },
      delivery_charge: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: true,
      },
      gluten_free_price: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Orders");
  },
};
