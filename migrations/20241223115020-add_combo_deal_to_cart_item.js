"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("CartItems", "comboDeal", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    });

    await queryInterface.addColumn("CartItems", "comboItems", {
      type: Sequelize.ARRAY(Sequelize.JSON),
      defaultValue: [],
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("CartItems", "comboDeal");
    await queryInterface.removeColumn("CartItems", "comboItems");
  },
};
