"use strict";
const bcrypt = require("bcrypt");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Admins", null, {});

    await queryInterface.bulkInsert("Admins", [
      {
        username: "admin",
        password: await bcrypt.hash("#superadmin", 8),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Admins", null, {});
  },
};
