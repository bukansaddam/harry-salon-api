const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class Employee extends Model {
        static associate(models) {
            // define association here
        }
    }

    Employee.init(
        {
            id: {
                type: DataTypes.STRING(10),
                primaryKey: true,
                allowNull: false,
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
                type: DataTypes.INTEGER(13),
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
}