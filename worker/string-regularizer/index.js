const Regularizer = require("../classes/regularizer");

module.exports = class StringRegularizer extends Regularizer {
  constructor({ reader, logger } = {}) {
    super({ reader, logger });
  }

  regularizeString(str) {
    return str
      .trim()
      .replace(/\u0001-\u0002/g, "")
      .replace(/\s?([·,\-'/()/\[\]\{\}])\s?/g, "·")
      .replace(/(?<!\d) ?(\d+) ?(?!\d)/g, "$1")
      .replace(/\s+/g, " ")
      .replace(/[′’]/g, "'")
      .replace(/[·•×\$]+/g, "·")
      .replace(/[\-–]+/g, "-")
      .replace(/^[,·\-\s]+/g, "") // TrimStart
      .replace(/[,·\-\s]+$/g, "") // TrimEnd
      .replace(/cyclo/gi, "cyclo"); // Capital letters
  }

  async regularize() {
    this.logger.startTask({ name: "Regularize" });

    return await this.reader.read().each(
      /**
       *
       * @param {import('sequelize').Model} mof
       */
      async (mof) => {
        this.logger.stepTask({ curStep: 0, maxStep: 1 });

        if (mof.name) mof.name = this.regularizeString(mof.name);
        if (mof.namePrecursor1)
          mof.namePrecursor1 = this.regularizeString(mof.namePrecursor1);
        if (mof.namePrecursor2)
          mof.namePrecursor2 = this.regularizeString(mof.namePrecursor2);
        if (mof.namePrecursor3)
          mof.namePrecursor3 = this.regularizeString(mof.namePrecursor3);
        await mof.save();

        this.logger.i("StringRegularizer", `${mof.name}`);
        this.logger.stepTask({ curStep: 1, maxStep: 0 });
      }
    );
  }
};
