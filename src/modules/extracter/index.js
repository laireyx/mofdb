/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('../logger')} Logger
 */

module.exports = class Extracter {
  /**
   *
   * @param {object} ctor
   * @param {number} ctor.nGramsCount
   * @param {Logger} ctor.logger
   */
  constructor({ nGramsCount = 10, logger } = {}) {
    this.nGramsCount = nGramsCount;
    this.logger = logger;
  }

  extract(mof) {}
};
