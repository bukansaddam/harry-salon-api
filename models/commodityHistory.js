const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class CommodityHistory extends Model {
    static associate(models) {
      CommodityHistory.belongsTo(models.commodity, {
        foreignKey: "commodityId",
        as: "commodity",
      });
    }
  }

  CommodityHistory.init(
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      commodityId: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdBy: {
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
      modelName: "commodityHistory",
      tableName: "commodity_history",
    }
  );

  paginate(CommodityHistory);

  return CommodityHistory;
};
