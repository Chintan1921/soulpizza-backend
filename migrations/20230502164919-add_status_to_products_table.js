"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Products",
      "status",
      {
        type: Sequelize.ENUM("enabled", "disabled"),
        allowNull: false,
        defaultValue: "enabled",
      },
      {
        after: "label_color",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("Products", "status");
  },
};
