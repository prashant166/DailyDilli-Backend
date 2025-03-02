"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Place extends Model {
    static associate(models) {
      // Associate Place with User (Creator)
      Place.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      Place.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });
    }
  }

  Place.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Category", // Explicit reference to "Category"
          key: "id",
        },
        onDelete: "CASCADE",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      budget_per_head: {
        type: DataTypes.ENUM("Low", "Medium", "High", "Luxury"),
        allowNull: false,
      },
      entry_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      best_time_to_visit: {
        type: DataTypes.ENUM("Morning", "Afternoon", "Evening", "Night"),
        allowNull: false,
      },
      parking_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM("pending", "approved"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Place",
      tableName: "Place",
      timestamps: true,
    }
  );

  return Place;
};
