'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("commodity_history", {
      id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      commodityId: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: "commodities",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      createdAt: {
        field: "created_at",
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        field: "updated_at",
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("commodity_history");
  }
};
