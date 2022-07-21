const generateTask = require(".");
const DatabaseReader = require("../modules/reader/database");
const MOFRegularizer = require("../modules/regularizer/mof");

/** @type {Model} */
const MOF = require("../../models").MOF;

module.exports = generateTask("StringRegularize", async (logger) => {
  const mofRegularizer = new MOFRegularizer({ logger });
  const databaseReader = new DatabaseReader({
    logger,
    model: MOF,
  });

  logger.setTaskMax(await databaseReader.estimateCount());

  return await databaseReader.read().each(
    /**
     *
     * @param {import('sequelize').Model} mof
     */
    async (mof) => {
      logger.stepTask();
      await mofRegularizer.regularize(mof);

      logger.i("StringRegularizer", `${mof.name}`);
    }
  );
});
