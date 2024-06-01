const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Earning extends Model {
    static associate(models) {
      Earning.belongsTo(models.payslip, {
        foreignKey: "payslipId",
      });
    }
  }

  Earning.init(
    {
        id: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
            defaultValue: () => nanoid(10),
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        payslipId: {
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
      modelName: "earning",
      tableName: "earnings",
    }
  );

  paginate(Earning);

  return Earning;
};
