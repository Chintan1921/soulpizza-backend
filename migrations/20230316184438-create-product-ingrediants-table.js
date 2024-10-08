"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ProductIngrediants", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      ingrediant_id: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: "Ingrediants",
          },
          key: "id",
        },
        allowNull: false,
      },
      is_required: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ProductIngrediants");
  },
};
