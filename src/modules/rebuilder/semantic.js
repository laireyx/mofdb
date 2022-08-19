/**
 * @typedef {typeof import('sequelize').Model} Model
 * @typedef {import('../logger')} Logger
 */

/** @type {Model} */
const SemanticUnit = require("../../../models").SemanticUnit;

module.exports = class SemanticRebuilder {
  /**
   *
   * @param {object} ctor
   * @param {Logger} ctor.logger
   */
  constructor({ logger } = {}) {
    this.logger = logger;
  }

  async prepare() {
    this.everySu = await SemanticUnit.findAll().then(
      (semanticUnit) => semanticUnit.name
    );
  }

  async rebuild() {
    this.everySu;
  }
};
