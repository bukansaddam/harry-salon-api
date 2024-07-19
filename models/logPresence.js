const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class LogPresence extends Model {
    static associate(models) {
      LogPresence.belongsTo(models.employee, {
        foreignKey: "employeeId",
        as: "employee",
      });
      LogPresence.belongsTo(models.store, {
        foreignKey: "storeId",
        as: "store",
      });
    }
  }

  LogPresence.init(
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      employeeId: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      storeId: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      timeStamp: {
        type: DataTypes.DATE,
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
      modelName: "logPresence",
      tableName: "log-presences",
    }
  );

  paginate(LogPresence);

  return LogPresence;
};
