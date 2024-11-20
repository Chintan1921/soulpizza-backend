"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "gluten_free_price");

    await queryInterface.addColumn(
      "Orders",
      "gluten_free_price",
      {
        type: Sequelize.JSON,
        allowNull: true,
      },
      {
        after: "delivery_charge",
      }
    );
  },

  async down(queryInterface, Sequelize) {},
};
