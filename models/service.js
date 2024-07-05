const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.belongsTo(models.store, {
        foreignKey: "storeId",
        as: "store",
      });
      Service.hasMany(models.order, {
        foreignKey: "serviceId",
      });
    }
  }

  Service.init(
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
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      storeId: {
        type: DataTypes.STRING(10),
        allowNull: true,
        references: {
          model: "stores",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
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
      modelName: "service",
      tableName: "services",
    }
  );

  paginate(Service);

  return Service;
};
