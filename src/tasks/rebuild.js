const generateTask = require(".");
const DatabaseReader = require("../modules/reader/database");
const MOFRegularizer = require("../modules/regularizer/mof");

/** @type {Model} */
const SemanticUnit = require("../../models").SemanticUnit;

module.exports = generateTask("Rebuild", async (logger) => {
  const mofReader = new DatabaseReader({
    logger,
    model: SemanticUnit,
  });

  logger.setTaskMax(await mofReader.estimateCount());

  return await mofReader.read().each(
    /**
     *
     * @param {import('sequelize').Model} mof
     */
    async (mof) => {
      logger.stepTask();

      // await SemanticUnit.findOne({ name });

      logger.i("Rebuild", `${mof.name}`);
    }
  );
});
