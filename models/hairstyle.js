const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class HairStyle extends Model {
    static associate(models) {
      HairStyle.hasMany(models.hairstyleImage, {
        foreignKey: "hairstyleId",
      });
      HairStyle.hasMany(models.order, {
        foreignKey: "hairstyleId",
      });
    }
  }

  HairStyle.init(
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(),
        allowNull: false,
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
      modelName: "hairstyle",
      tableName: "hairstyles",
    }
  );

  paginate(HairStyle);

  return HairStyle;
};
