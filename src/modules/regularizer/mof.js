const Regularizer = require(".");

module.exports = class MOFRegularizer extends Regularizer {
  /**
   * Regularize mof object
   * @param {import('sequelize').Model} mof
   */
  async regularize(mof) {
    if (mof.name) mof.name = this.regularizeString(mof.name);
    if (mof.namePrecursor1)
      mof.namePrecursor1 = this.regularizeString(mof.namePrecursor1);
    if (mof.namePrecursor2)
      mof.namePrecursor2 = this.regularizeString(mof.namePrecursor2);
    if (mof.namePrecursor3)
      mof.namePrecursor3 = this.regularizeString(mof.namePrecursor3);
    return await mof.save();
  }
};
