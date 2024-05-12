const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Deduction extends Model {
    static associate(models) {
      Deduction.belongsTo(models.payslip, {
        foreignKey: "payslipId",
      });
    }
  }

  Deduction.init(
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
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: "deduction",
      tableName: "deductions",
    }
  );

  paginate(Deduction);

  return Deduction;
};
