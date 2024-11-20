"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Stores",
      "delivery_options",
      {
        type: Sequelize.JSON,
        allowNull: false,
      },
      {
        after: "address",
      }
    );
    await queryInterface.addColumn(
      "Stores",
      "payment_options",
      {
        type: Sequelize.JSON,
        allowNull: false,
      },
      {
        after: "address",
      }
    );
    await queryInterface.addColumn(
      "Stores",
      "open_close_timings",
      {
        type: Sequelize.JSON,
        allowNull: false,
      },
      {
        after: "address",
      }
    );
    await queryInterface.addColumn(
      "Stores",
      "pincode",
      {
        type: Sequelize.STRING(11),
        allowNull: false,
      },
      { after: "address" }
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("Stores", "delivery_options"),
        queryInterface.removeColumn("Stores", "payment_options"),
        queryInterface.removeColumn("Stores", "open_close_timings"),
        queryInterface.removeColumn("Stores", "pincode"),
      ]);
    });
  },
};
