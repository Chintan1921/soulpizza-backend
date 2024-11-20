"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("StoreProducts", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      product_id: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: "Products",
          },
          key: "id",
        },
        allowNull: false,
      },
      status: {
        type: Sequelize.DataTypes.ENUM("enabled", "disabled"),
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("StoreProducts");
  },
};
