const generateTask = require(".");

/** @type {Model} */
const MOF = require("../../models").MOF;

module.exports = generateTask(
  "BuildPorous",
  /**
   * Build PorousDB
   * @param {import('../modules/logger')} logger
   */
  async function (logger) {
    const PorousReader = require("../modules/reader/porous");

    const porousReader = new PorousReader({
      workDir: [
        "./data/1st_only_text/1st/Porous_set_1.0.0/Porous_DB_1.0.0",
        "./data/2nd_1.0_only_text/2nd_1.0/Porous_DB_1.0.0/Porous_DB_1.0.0",
      ],
      logger,
      MOF,
    });

    // logger.setTaskMax(await porousReader.estimateCount());

    const porouses = await porousReader.read().toArray();

    try {
      await MOF.bulkCreate(porouses);
    } catch (err) {
      logger.e(
        "PorousBuilder",
        `Failed to create db entity for:\n${JSON.stringify(porousObj, null, 2)}`
      );
    }

    // return await porousReader.read().each(async (porousObj) => {
    //   try {
    //     await MOF.create(porousObj);
    //   } catch (err) {
    //     logger.e(
    //       "PorousBuilder",
    //       `Failed to create db entity for:\n${JSON.stringify(
    //         porousObj,
    //         null,
    //         2
    //       )}`
    //     );
    //   } finally {
    //     logger.stepTask();
    //   }
    // });
  }
);
