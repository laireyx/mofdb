const DatabaseReader = require("../../database-reader");

/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('../logger')} Logger
 */
module.exports = class Regularizer {
  /**
   *
   * @param {object} ctor
   * @param {DatabaseReader} ctor.reader
   * @param {Logger} ctor.logger
   */
  constructor({ reader, logger } = {}) {
    this.reader = reader;
    this.logger = logger;
  }

  async regularize() {}
};
