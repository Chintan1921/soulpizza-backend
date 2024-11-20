"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
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
      sub_category: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: Sequelize.DataTypes.JSON,
        allowNull: true,
      },
      label_color: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Products");
  },
};
