const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class PlaceSafetyFeedback extends Model {
    static associate(models) {
      PlaceSafetyFeedback.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      PlaceSafetyFeedback.belongsTo(models.Place, {
        foreignKey: "place_id",
        as: "place",
      });
    }
  }

  PlaceSafetyFeedback.init(
    {
      felt_safe: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PlaceSafetyFeedback",
      tableName: "PlaceSafetyFeedback",
      timestamps: true,
    }
  );

  return PlaceSafetyFeedback;
};
