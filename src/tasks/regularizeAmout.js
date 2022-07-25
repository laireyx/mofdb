const fs = require("fs/promises");
const generateTask = require(".");
const MolWeightDownloader = require("../modules/downloader/molweight");
const DatabaseReader = require("../modules/reader/database");

/** @type {Model} */
const MOF = require("../../models").MOF;

module.exports = generateTask("AmountRegularize", async (logger) => {
  const databaseReader = new DatabaseReader({
    logger,
    model: MOF,
  });
  const molWeightDownloader = new MolWeightDownloader({
    logger,
    downloadDir: "molweight",
    downloadInterval: 200,
  });

  logger.setTaskMax(await databaseReader.estimateCount());

  return await databaseReader.read().each(
    /**
     *
     * @param {import('sequelize').Model} mof
     */
    async (mof) => {
      logger.stepTask();

      for (let i = 1; i <= 3; i++) {
        const columnName = `amountPrecursor${i}`;
        const precursorName = `namePrecursor${i}`;
        let molAmount;

        if (!mof[columnName]) continue;

        if (mof[columnName].match(/([\d.]+) ?mmol/i)) {
          molAmount =
            parseFloat(mof[columnName].match(/([\d.]+) ?mmol/i)[1]) / 1000;
        } else if (mof[columnName].match(/([\d.]+) ?mol/i)) {
          molAmount = parseFloat(mof[columnName].match(/([\d.]+) ?mol/i)[1]);
        }

        if (!molAmount) continue;

        try {
          const weightFile = await molWeightDownloader.download({
            resource: mof[precursorName],
          });
          if (!weightFile) continue;

          const molWeight = await fs
            .readFile(weightFile)
            .then((buf) => buf.toString())
            .then((str) => parseFloat(str));
          const value = molAmount * molWeight;

          logger.i(
            "AmountRegularizer",
            `${molAmount}mol of ${mof[precursorName]} is ${value}(${molAmount} * ${molWeight}).`
          );
          if (molWeight) mof[columnName] = molWeight;
        } catch (err) {
          console.error(err);
          logger.e("AmountRegularizer", err);
        }
      }

      await mof.save();
    }
  );
});
