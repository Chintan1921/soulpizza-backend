"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Stores",
      "state",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      {
        after: "address",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("Stores", "state");
  },
};
