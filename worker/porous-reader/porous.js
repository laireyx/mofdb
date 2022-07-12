module.exports = class Porous {
  /**
   *
   * @param {object} porous
   * @param {string} porous.name
   * @param {string} porous.crystalStructure
   * @param {string} porous.sampleType
   * @param {string} porous.doi
   * @param {string} porous.title
   * @param {string} porous.author
   * @param {string} porous.namePrecursor1
   * @param {string} porous.amountPrecursor1
   * @param {string} porous.namePrecursor2
   * @param {string} porous.amountPrecursor2
   * @param {string} porous.namePrecursor3
   * @param {string} porous.amountPrecursor3

   * @param {string} porous.nameSolvent1
   * @param {string} porous.amountSolvent1
   * @param {string} porous.nameSolvent2
   * @param {string} porous.amountSolvent2
   * @param {string} porous.nameSolvent3
   * @param {string} porous.amountSolvent3

   * @param {string} porous.reactionTemperature
   * @param {string} porous.reactionTime
   * @param {string} porous.synthesisMethod
   */
  constructor(
    porous = {
      name: "",
      crystalStructure: "",
      sampleType: "",
      doi: "",
      title: "",
      author: "",
      namePrecursor1: "",
      amountPrecursor1: "",
      namePrecursor2: "",
      amountPrecursor2: "",
      namePrecursor3: "",
      amountPrecursor3: "",

      nameSolvent1: "",
      amountSolvent1: "",
      nameSolvent2: "",
      amountSolvent2: "",
      nameSolvent3: "",
      amountSolvent3: "",

      reactionTemperature: "",
      reactionTime: "",
      synthesisMethod: "",
    }
  ) {
    const mof = models.MOF.create(porous);
  }
};
