"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Addresses", {
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
      street: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
      },
      city: {
        type: Sequelize.DataTypes.STRING(50),
        allowNull: false,
      },
      state: {
        type: Sequelize.DataTypes.STRING(50),
        allowNull: false,
      },
      zip: {
        type: Sequelize.DataTypes.STRING(11),
        allowNull: false,
      },
      country: {
        type: Sequelize.DataTypes.STRING(50),
        allowNull: false,
      },
      is_default: {
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
