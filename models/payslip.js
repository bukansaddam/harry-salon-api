const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Payslip extends Model {
    static associate(models) {
      Payslip.belongsTo(models.employee, {
        foreignKey: "employeeId",
      });
      Payslip.hasMany(models.earning, {
        foreignKey: "payslipId",
      });
      Payslip.hasMany(models.deduction, {
        foreignKey: "payslipId",
      });
    }
  }

  Payslip.init(
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
      attachment: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      total: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      employeeId: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.STRING(10),
        allowNull: false,
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
      modelName: "payslip",
      tableName: "payslips",
    }
  );

  paginate(Payslip);

  return Payslip;
};
