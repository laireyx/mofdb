"use strict";
const { Model } = require("sequelize");
/**
 *
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 * @returns
 */
module.exports = (sequelize, DataTypes) => {
  class Precursor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Precursor.init(
    {
      name: DataTypes.STRING,
      canonicalId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Precursor",
    }
  );
  return Precursor;
};
