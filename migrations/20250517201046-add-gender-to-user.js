"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("User", "gender", {
      type: Sequelize.ENUM("male", "female", "other"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("User", "gender");
  },
};
