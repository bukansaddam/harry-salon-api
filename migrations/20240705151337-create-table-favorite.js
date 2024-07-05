'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("favorites", {
      id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      userId: {
        type: Sequelize.STRING(10),
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      hairstyleId: {
        type: Sequelize.STRING(10),
        allowNull: true,
        references: {
          model: "hairstyles",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      },
      createdAt: {
        field: "created_at",
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        field: "updated_at",
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("favorites");
  }
};
