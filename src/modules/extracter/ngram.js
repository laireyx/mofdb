/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('../logger')} Logger
 */

const Extracter = require(".");

module.exports = class NgramExtracter extends Extracter {
  nGramsCount = 9;
  minimumN = 2;

  /**
   *
   * @param {object} ctor
   * @param {number} ctor.nGramsCount
   * @param {Logger} ctor.logger
   */
  constructor({ nGramsCount = 9, minimumN = 2, logger } = {}) {
    super({ logger });
    this.nGramsCount = nGramsCount;
    this.minimumN = minimumN;
    this.chemRegex = /([A-Z][a-z]{0,2}\d*)+/g;
  }

  extract(mof) {
    const targetStrings = [
      mof.name ?? "",
      mof.namePrecursor1 ?? "",
      mof.namePrecursor2 ?? "",
      mof.namePrecursor3 ?? "",
      mof.nameSolvent1 ?? "",
      mof.nameSolvent2 ?? "",
      mof.nameSolvent3 ?? "",
    ];

    const ret = [];

    for (let n = 0; n < this.nGramsCount; n++) ret[n] = [];

    targetStrings
      .flatMap((str) => str.match(this.chemRegex) ?? [])
      .forEach((chemForm) => {
        const len = chemForm.length;
        if (len >= this.minimumN) ret[len].push(chemForm.toLowerCase());
      });

    targetStrings
      .map((str) => str.replace(this.chemRegex, ""))
      .map((str) => str.toLowerCase().split(/\W+/))
      .flat()
      .forEach((str) => {
        for (let n = this.minimumN; n < this.nGramsCount; n++) {
          for (let i = 0; i <= str.length - n; i++) {
            ret[n].push(str.substring(i, i + n));
          }
        }
      });

    return ret;
  }
};
