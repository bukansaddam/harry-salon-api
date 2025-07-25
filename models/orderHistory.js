const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class OrderHistory extends Model {
    static associate(models) {
      OrderHistory.belongsTo(models.order, {
        foreignKey: "orderId",
      });
    }
  }

  OrderHistory.init(
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      orderId: {
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
      modelName: "orderHistory",
      tableName: "order_histories",
    }
  );

  paginate(OrderHistory);

  return OrderHistory;
};
