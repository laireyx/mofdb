"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SemanticUnit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SemanticUnit.init(
    {
      suid: DataTypes.INTEGER,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      charset: "utf8",
      collate: "utf8_general_ci",
      modelName: "SemanticUnit",
    }
  );
  return SemanticUnit;
};
