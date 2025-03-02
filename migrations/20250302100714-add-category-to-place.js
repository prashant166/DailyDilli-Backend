"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Place", "category_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Category",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Place", "category_id");
  },
};
