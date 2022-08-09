const Regularizer = require(".");

module.exports = class ExtractRegularizer extends Regularizer {
  unit = [
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

    "iso",
    "cis",
    "trans",

    "cyclo",

    "phospho",
    "chloro",
    "bromo",

    "amino",

    "methyl",
    "ethyl",
    "propyl",
    "phenyl",

    "pyridyl",

    "\\d+[']*(·\\d+[']*)*[·]?", // quantifier
    "(?:([A-Z][a-z]{0,1}\\d*|\\([A-Z][a-z]{0,1}\\d*\\))+)", // chemical
  ];
  delims = [",", ".", " "];

  /**
   *
   * @param {*} mof
   * @returns
   */
  async regularize(mof) {
    const targetStrings = [
      mof.name ?? "",
      mof.namePrecursor1 ?? "",
      mof.namePrecursor2 ?? "",
      mof.namePrecursor3 ?? "",
      mof.nameSolvent1 ?? "",
      mof.nameSolvent2 ?? "",
      mof.nameSolvent3 ?? "",
    ];

    const delimRegex = new RegExp(`[${this.delims.join()}]`);
    const regex = new RegExp(
      `(?:${this.unit.join("|")})+|[({[].*?[)}\]]|.*`,
      "gi"
    );

    return targetStrings
      .map((str) =>
        str.split(delimRegex).map((splittedStr) => splittedStr.match(regex))
      )
      .flat(99)
      .filter((_) => _);
  }
};
