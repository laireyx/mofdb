const generateTask = require(".");
const DatabaseReader = require("../modules/reader/database");

const {
  Precursor,
  sequelize,
  Sequelize: { Op },
} = require("../../models");

module.exports = generateTask(
  "Extract",
  /**
   * Build PrecursorDB
   * @param {import('../modules/logger')} logger
   */
  async function (logger) {
    const precursorReader = new DatabaseReader({
      logger,
      model: Precursor,
    });

    logger.addTaskMax(await precursorReader.estimateCount());
    precursorReader.read().each((precursor) => {
      logger.stepTask();
      const chemical = precursor.name.match(
        /([A-Z][a-z]{0,1}\d*|\([A-Z][a-z]{0,1}\d*\))+/
      );

      if (chemical) logger.i("Extract", chemical[0]);
    });
  }
);
