"use strict";
module.exports = {
  /**
   *
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "MOFs",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        doi: {
          type: Sequelize.STRING,
        },
        name: {
          type: Sequelize.STRING,
        },
        crystalStructure: {
          type: Sequelize.STRING,
        },
        sampleType: {
          type: Sequelize.STRING,
        },
        namePrecursor1: {
          type: Sequelize.STRING,
        },
        namePrecursor2: {
          type: Sequelize.STRING,
        },
        namePrecursor3: {
          type: Sequelize.STRING,
        },
        amountPrecursor1: {
          type: Sequelize.STRING,
        },
        amountPrecursor2: {
          type: Sequelize.STRING,
        },
        amountPrecursor3: {
          type: Sequelize.STRING,
        },
        nameSolvent1: {
          type: Sequelize.STRING,
        },
        nameSolvent2: {
          type: Sequelize.STRING,
        },
        nameSolvent3: {
          type: Sequelize.STRING,
        },
        amountSolvent1: {
          type: Sequelize.STRING,
        },
        amountSolvent2: {
          type: Sequelize.STRING,
        },
        amountSolvent3: {
          type: Sequelize.STRING,
        },
        reactionTemperature: {
          type: Sequelize.STRING,
        },
        reactionTime: {
          type: Sequelize.STRING,
        },
        synthesisMethod: {
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("MOFs");
  },
};
