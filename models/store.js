const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    static associate(models) {
      Store.belongsTo(models.owner, {
        foreignKey: "ownerId",
      });
      Store.hasMany(models.image, {
        foreignKey: "storeId",
      });
      Store.hasMany(models.commodity, {
        foreignKey: "storeId",
      });
      Store.hasMany(models.employee, {
        foreignKey: "storeId",
      });
      Store.hasMany(models.service, {
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
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      openAt: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      closeAt: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      ownerId: {
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
      modelName: "store",
      tableName: "stores",
    }
  );

  paginate(Store);

  return Store;
};
