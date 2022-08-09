const generateTask = require(".");
const DatabaseReader = require("../modules/reader/database");

const { MOF } = require("../../models");
const ExtractRegularizer = require("../modules/regularizer/extract");

module.exports = generateTask(
  "Extract",
  /**
   * Build PrecursorDB
   * @param {import('../modules/logger')} logger
   */
  async function (logger) {
    const mofReader = new DatabaseReader({
      logger,
      model: MOF,
    });

    const extractRegularizer = new ExtractRegularizer({ logger });

    logger.addTaskMax(await mofReader.estimateCount());

    return await mofReader.read().each(async (mof) => {
      logger.stepTask();
      logger.i(
        "Extract",
        JSON.stringify(await extractRegularizer.regularize(mof))
      );
    });
  }
);
