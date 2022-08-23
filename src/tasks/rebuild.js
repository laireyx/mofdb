const generateTask = require(".");
const DatabaseReader = require("../modules/reader/database");
const SemanticRebuilder = require("../modules/rebuilder/semantic");

/** @type {Model} */
const { MOF } = require("../../models");

module.exports = generateTask("Rebuild", async (logger) => {
  const mofReader = new DatabaseReader({
    logger,
    model: MOF,
  });
  const rebuilder = new SemanticRebuilder({ logger });

  logger.setTaskMax(await mofReader.estimateCount());

  await rebuilder.prepare();

  return await mofReader.read().each(
    /**
     *
     * @param {import('sequelize').Model} mof
     */
    async (mof) => {
      logger.stepTask();

      const rebuildResult = rebuilder.rebuild(mof);

      for (const [k, v] of Object.entries(rebuildResult)) {
        logger.i("Rebuild", `${mof[k]} => ${JSON.stringify(v)}`);
      }
    }
  );
});
