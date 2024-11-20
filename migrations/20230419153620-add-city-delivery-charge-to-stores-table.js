"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Stores",
      "city",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      {
        after: "address",
      }
    );
    await queryInterface.addColumn(
      "Stores",
      "delivery_charge",
      {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      {
        after: "payment_options",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Stores", "city");
    await queryInterface.removeColumn("Stores", "delivery_charge");
  },
};
