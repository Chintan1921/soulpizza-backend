"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "CartItems",
      "store_id",
      {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: "Stores",
          },
          key: "id",
        },
        allowNull: false,
      },
      {
        after: "quantity",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("CartItems", "store_id");
  },
};
