/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('../logger')} Logger
 */

module.exports = class Reader {
  /**
   * Reader
   * @param {object} ctor
   * @param {string} ctor.workDir
   * @param {Logger} ctor.logger
   */
  constructor({ workDir, logger } = {}) {
    this.workDir = workDir;
    this.logger = logger;
  }

  read({} = {}) {}
};
