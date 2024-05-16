const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.user, {
        foreignKey: "userId",
        as: "user",
      });
      Order.belongsTo(models.store, {
        foreignKey: "storeId",
        as: "store",
      });
      Order.belongsTo(models.employee, {
        foreignKey: "employeeId",
        as: "employee",
      });
      Order.belongsTo(models.hairstyle, {
        foreignKey: "hairstyleId",
        as: "hairstyle",
      });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      userId: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      storeId: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      employeeId: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      service_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      service_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      hairstyleId: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      status: {
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
      modelName: "order",
      tableName: "orders",
    }
  );

  paginate(Order);

  return Order;
};
