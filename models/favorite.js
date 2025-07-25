const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    static associate(models) {
      Favorite.belongsTo(models.user, {
        foreignKey: "userId",
      });
      Favorite.belongsTo(models.hairstyle, {
        foreignKey: "hairstyleId",
      });
    }
  }

  Favorite.init(
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      userId: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      hairstyleId: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      createdAt: {
        field: "created_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        field: "updated_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "favorite",
      tableName: "favorites",
    }
  );

  paginate(Favorite);

  return Favorite;
};
