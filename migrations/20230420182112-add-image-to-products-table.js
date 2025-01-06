"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Products",
      "image",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      {
        after: "price",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("Products", "image");
  },
};
