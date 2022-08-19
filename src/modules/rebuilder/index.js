/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('../logger')} Logger
 */

module.exports = class Rebuilder {
  /**
   *
   * @param {object} ctor
   * @param {Logger} ctor.logger
   */
  constructor({ logger } = {}) {
    this.logger = logger;
  }

  async rebuild() {}
};
