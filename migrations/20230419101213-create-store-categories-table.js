"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("StoreCategories", {
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
      category_id: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: "ProductCategories",
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
    await queryInterface.dropTable("StoreCategories");
  },
};
