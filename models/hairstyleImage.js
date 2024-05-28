const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class HairstyleImage extends Model {
    static associate(models) {
      HairstyleImage.belongsTo(models.store, {
        foreignKey: "hairstyleId",
      });
    }
  }

  HairstyleImage.init(
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      image: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      hairstyleId: {
        type: DataTypes.STRING(10),
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
      modelName: "hairstyleImage",
      tableName: "hairstyle_images",
    }
  );

  paginate(HairstyleImage);

  return HairstyleImage;
};
