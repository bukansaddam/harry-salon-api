'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('deductions', {
      id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => nanoid(10),
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      amount: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      payslipId: {
        type: Sequelize.STRING(10),
        allowNull: true,
        references: {
          model: 'payslips',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('deductions');
  }
};
