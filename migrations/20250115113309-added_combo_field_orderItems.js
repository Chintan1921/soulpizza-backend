"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("OrderItems", "comboDeal", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    });

    await queryInterface.addColumn("OrderItems", "comboItems", {
      type: Sequelize.ARRAY(Sequelize.JSON),
      defaultValue: [],
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("OrderItems", "comboDeal");
    await queryInterface.removeColumn("OrderItems", "comboItems");
  },
};
