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
      Order.belongsTo(models.service, {
        foreignKey: "serviceId",
        as: "service",
      });
      Order.hasMany(models.orderHistory, {
        foreignKey: "orderId",
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
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
      serviceId: {
        type: DataTypes.STRING(10),
        allowNull: true,
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
        defaultValue: "pending",
      },
      isAccepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isOnLocation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      linkPayment: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
