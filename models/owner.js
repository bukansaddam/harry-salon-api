const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Owner extends Model {
    static associate(models) {
      Owner.hasMany(models.store, {
        foreignKey: "ownerId",
      });
    }
  }

  Owner.init(
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
      modelName: "owner",
      tableName: "owners",
    }
  );

  paginate(Owner);

  return Owner;
};
