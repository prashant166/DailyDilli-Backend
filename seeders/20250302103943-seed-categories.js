"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Category", [
      { name: "Historical" },
      { name: "Cafe" },
      { name: "Adventure" },
      { name: "Romantic" },
      { name: "Shopping" },
      { name: "Religious" },
      { name: "Cultural" },
      { name: "Entertainment" },
      { name: "Nightlife" },
      { name: "Family-friendly" },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Category", null, {});
  },
};
