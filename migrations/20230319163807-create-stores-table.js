"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Stores", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      owner_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.DataTypes.ENUM("active", "inactive"),
        allowNull: false,
      },
      phone: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      cod_enabled: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        comment: "Flag to enable cash on delivery",
      },
      card_enabled: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        comment: "Flag to enable card payment",
      },
      pickup_enabled: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        comment: "Flag to enable pickup feature for store",
      },
      delivery_enabled: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        comment: "Flag to enable delivery feature for store",
      },
      pickup_time: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        comment:
          "represents how much time in minutes it will take for order to be prepared for pick up.",
      },
      delivery_time: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        comment:
          "represents how much time in minutes it will take to deliver order.",
      },
      tax: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: true,
      },
      hours_details: {
        type: Sequelize.DataTypes.JSON,
        allowNull: true,
        comment: "represents store opening and closing time for week days.",
      },
      gluten_free_price: {
        type: Sequelize.DataTypes.JSON,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Stores");
  },
};
