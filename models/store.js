const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    static associate(models) {
      Store.hasMany(models.image, {
        foreignKey: "storeId",
      });
    }
  }

  Store.init(
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
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      open: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      close: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      status: {
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
      modelName: "store",
      tableName: "stores",
    }
  );

  paginate(Store);

  return Store;
};
