const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.hasMany(models.payslip, {
        foreignKey: "employeeId",
      });
      Employee.belongsTo(models.store, {
        foreignKey: "storeId",
      });
      Employee.hasMany(models.order, {
        foreignKey: "employeeId",
      });
      Employee.hasMany(models.logPresence, {
        foreignKey: "employeeId",
      });
      Employee.hasMany(models.presence, {
        foreignKey: "employeeId",
      });
    }
  }

  Employee.init(
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
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.BIGINT(),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      storeId: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      createdBy: {
        field: "created_by",
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
      modelName: "employee",
      tableName: "employees",
    }
  );

  paginate(Employee);

  return Employee;
};
