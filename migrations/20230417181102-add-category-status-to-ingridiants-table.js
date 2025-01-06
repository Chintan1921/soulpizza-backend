"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Ingrediants", "category", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Ingrediants", "status", {
      type: Sequelize.ENUM("enabled", "disabled"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Ingrediants", "category");
    await queryInterface.removeColumn("Ingrediants", "status");
  },
};
