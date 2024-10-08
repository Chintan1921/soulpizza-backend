"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Stores", "cod_enabled");
    await queryInterface.removeColumn("Stores", "card_enabled");
    await queryInterface.removeColumn("Stores", "pickup_enabled");
    await queryInterface.removeColumn("Stores", "delivery_enabled");
    await queryInterface.removeColumn("Stores", "hours_details");
  },

  async down(queryInterface, Sequelize) {},
};
