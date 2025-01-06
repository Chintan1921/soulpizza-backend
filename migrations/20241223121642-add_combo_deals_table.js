"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ComboDeals", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Products", // Ensure the table name 'Products' matches the actual name
          key: "id",
        },
        allowNull: false,
      },
      store_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Stores", // Ensure the table name 'Stores' matches the actual name
          key: "id",
        },
        allowNull: false,
      },
      crust_type: {
        type: Sequelize.ENUM("deep_pan", "thin"),
        allowNull: true,
      },
      size: {
        type: Sequelize.ENUM("small", "large"),
        allowNull: true,
      },
      gluten_free: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      ingredients: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ComboDeals");
  },
};
