"use strict";
const { Model } = require("sequelize");
/**
 *
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 * @returns
 */
module.exports = (sequelize, DataTypes) => {
  class MOF extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MOF.init(
    {
      doi: DataTypes.STRING,
      name: DataTypes.STRING,
      crystalStructure: DataTypes.STRING,
      sampleType: DataTypes.STRING,
      namePrecursor1: DataTypes.STRING,
      namePrecursor2: DataTypes.STRING,
      namePrecursor3: DataTypes.STRING,
      amountPrecursor1: DataTypes.STRING,
      amountPrecursor2: DataTypes.STRING,
      amountPrecursor3: DataTypes.STRING,
      nameSolvent1: DataTypes.STRING,
      nameSolvent2: DataTypes.STRING,
      nameSolvent3: DataTypes.STRING,
      amountSolvent1: DataTypes.STRING,
      amountSolvent2: DataTypes.STRING,
      amountSolvent3: DataTypes.STRING,
      reactionTemperature: DataTypes.STRING,
      reactionTime: DataTypes.STRING,
      synthesisMethod: DataTypes.STRING,
    },
    {
      sequelize,
      charset: "utf8",
      collate: "utf8_general_ci",
      modelName: "MOF",
    }
  );
  return MOF;
};
