"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add "DayTime" to ENUM type best_time_to_visit (PostgreSQL only)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type typ
          JOIN pg_enum enm ON enm.enumtypid = typ.oid
          WHERE typ.typname = 'enum_Place_best_time_to_visit'
          AND enm.enumlabel = 'DayTime'
        ) THEN
          ALTER TYPE "enum_Place_best_time_to_visit" ADD VALUE 'DayTime';
        END IF;
      END $$;
    `);

    // Set default value for budget_per_head
    await queryInterface.changeColumn("Place", "budget_per_head", {
      type: Sequelize.ENUM("Low", "Medium", "High", "Luxury"),
      allowNull: false,
      defaultValue: "Medium",
    });

    // Set default value for best_time_to_visit
    await queryInterface.changeColumn("Place", "best_time_to_visit", {
      type: Sequelize.ENUM("Morning", "Afternoon", "Evening", "Night", "DayTime"),
      allowNull: false,
      defaultValue: "DayTime",
    });
  },

  async down(queryInterface, Sequelize) {
    // WARNING: PostgreSQL does not support removing a specific ENUM value easily.
    // Here, we just revert default values.
    await queryInterface.changeColumn("Place", "budget_per_head", {
      type: Sequelize.ENUM("Low", "Medium", "High", "Luxury"),
      allowNull: false,
    });

    await queryInterface.changeColumn("Place", "best_time_to_visit", {
      type: Sequelize.ENUM("Morning", "Afternoon", "Evening", "Night"),
      allowNull: false,
    });
  },
};
