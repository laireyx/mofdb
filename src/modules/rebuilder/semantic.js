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
    this.everySu = [];
    this.testRegex = null;
  }

  async prepare() {
    await SemanticUnit.findAll().then((semanticUnits) => {
      this.everySu = semanticUnits.map((unit) => unit.name);
    });

    this.testRegex = new RegExp(`(?=(${this.everySu.join("|")}))`, "gi");
  }

  rebuild(mof) {
    const rebuildResult = {};

    if (mof.name)
      rebuildResult.name = [...mof.name.matchAll(this.testRegex)].map(
        (x) => x[1]
      );

    if (mof.namePrecursor1)
      rebuildResult.namePrecursor1 = [
        ...mof.namePrecursor1.matchAll(this.testRegex),
      ].map((x) => x[1]);
    if (mof.namePrecursor2)
      rebuildResult.namePrecursor2 = [
        ...mof.namePrecursor2.matchAll(this.testRegex),
      ].map((x) => x[1]);
    if (mof.namePrecursor3)
      rebuildResult.namePrecursor3 = [
        ...mof.namePrecursor3.matchAll(this.testRegex),
      ].map((x) => x[1]);

    if (mof.nameSolvent1)
      rebuildResult.nameSolvent1 = [
        ...mof.nameSolvent1.matchAll(this.testRegex),
      ].map((x) => x[1]);
    if (mof.nameSolvent2)
      rebuildResult.nameSolvent2 = [
        ...mof.nameSolvent2.matchAll(this.testRegex),
      ].map((x) => x[1]);
    if (mof.nameSolvent3)
      rebuildResult.nameSolvent3 = [
        ...mof.nameSolvent3.matchAll(this.testRegex),
      ].map((x) => x[1]);

    return rebuildResult;
  }
};
