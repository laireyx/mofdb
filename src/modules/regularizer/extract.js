const Regularizer = require(".");

module.exports = class ExtractRegularizer extends Regularizer {
  /**
   *
   * @param {*} mof
   * @returns
   */
  async regularize(mof) {
    const prefixes = [
      "iso",
      "mono",
      "di",
      "bis",
      "tri",
      "tris",
      "tetra",
      "tetrakis",
      "penta",
      "pentakis",
      "hexa",
      "hexakis",
      "hepta",
      "heptakis",
      "octa",
      "octakis",
      "nona",
      "nonakis",
      "deca",
      "decakis",
    ];
    const postfixes = ["yl", "ene"];

    const regex = new RegExp(`${prefixes}.*${postfixes}`, "gi");
    const matchResults = [];

    matchResults.push(...mof.name.match(regex));
    if (mof.namePrecursor1)
      matchResults.push(...mof.namePrecursor1.match(regex));
    if (mof.namePrecursor2)
      matchResults.push(...mof.namePrecursor2.match(regex));
    if (mof.namePrecursor3)
      matchResults.push(...mof.namePrecursor3.match(regex));

    if (mof.nameSolvent1) matchResults.push(...mof.nameSolvent1.match(regex));
    if (mof.nameSolvent2) matchResults.push(...mof.nameSolvent2.match(regex));
    if (mof.nameSolvent3) matchResults.push(...mof.nameSolvent3.match(regex));

    return matchResults;
  }
};
