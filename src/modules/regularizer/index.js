/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('../logger')} Logger
 */
module.exports = class Regularizer {
  /**
   *
   * @param {object} ctor
   * @param {Logger} ctor.logger
   */
  constructor({ logger } = {}) {
    this.logger = logger;
  }

  /**
   * Regularize a chemical string
   * @param {string} str
   * @return {string}
   */
  regularizeString(str) {
    return str
      .trim()
      .replace(/[\u0001-\u0002]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\s?([·,\-/])\s?/g, "·")
      .replace(/[′’]/g, "'")
      .replace(/[·•×\$]+/g, "·")
      .replace(/[\-–]+/g, "-")
      .replace(/^[,·\-\s]+/g, "") // TrimStart
      .replace(/[,·\-\s]+$/g, "") // TrimEnd
      .replace(/cyclo/gi, "cyclo"); // Capital letters
  }

  async regularize() {}
};
