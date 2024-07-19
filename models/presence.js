const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Presence extends Model {
    static associate(models) {
      Presence.belongsTo(models.employee, {
        foreignKey: "employeeId",
        as: "employee",
      });
      Presence.belongsTo(models.store, {
        foreignKey: "storeId",
        as: "store",
      });
    }
  }

  Presence.init(
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
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      entryTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      exitTime: {
        type: DataTypes.DATE,
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
      modelName: "presence",
      tableName: "presences",
    }
  );

  paginate(Presence);

  return Presence;
};
