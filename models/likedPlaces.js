"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class LikedPlace extends Model {
    static associate(models) {
      LikedPlace.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      LikedPlace.belongsTo(models.Place, {
        foreignKey: "place_id",
        as: "place",
      });
    }
  }

  LikedPlace.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Place",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "LikedPlace",
      tableName: "LikedPlace",
      timestamps: true,
    }
  );

  return LikedPlace;
};
