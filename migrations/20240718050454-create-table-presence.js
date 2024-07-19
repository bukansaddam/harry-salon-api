'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("presences", { 
      id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      employeeId: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      storeId: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      entryTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      exitTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: false,
      },
     });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("presences");
  }
};
