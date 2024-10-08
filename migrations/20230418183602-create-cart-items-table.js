"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CartItems", {
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
      crust_type: {
        type: Sequelize.DataTypes.ENUM("deep_pan", "thin"),
        allowNull: true,
      },
      size: {
        type: Sequelize.DataTypes.ENUM("small", "large"),
        allowNull: true,
      },
      gluten_free: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
      },
      ingrediants: {
        type: Sequelize.DataTypes.JSON,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("CartItems");
  },
};
