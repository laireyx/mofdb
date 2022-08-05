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
      try {
        for (let i = 1; i <= 3; i++) {
          try {
            const columnName = `amountPrecursor${i}`;
            const precursorName = `namePrecursor${i}`;
            let molAmount;

            if (!mof[columnName]) continue;

            // Redundant information
            if (mof[columnName].match(/([\d.]+) ?mg/i)) {
              mof[columnName] = mof[columnName].match(/([\d.]+) ?mg/i)[1];
              continue;
            }

            if (mof[columnName].match(/([\d.]+) ?\([\d.]+ ?m?mol\)/i)) {
              mof[columnName] = mof[columnName].match(
                /([\d.]+) ?\([\d.]+ ?m?mol\)/i
              )[1];
              continue;
            }

            // Wrong unit
            if (mof[columnName].match(/([\d.]+) ?\(?mmol\)?/i)) {
              molAmount = parseFloat(
                mof[columnName].match(/([\d.]+) ?\(?mmol\)?/i)[1]
              );
            } else if (mof[columnName].match(/([\d.]+) ?\(?mol\)?/i)) {
              molAmount =
                parseFloat(mof[columnName].match(/([\d.]+) ?\(?mol\)?/i)[1]) *
                1000;
            }

            if (!molAmount) continue;

            let weightFile = await (async () => {
              const pubchemResult = await molWeightDownloader.download({
                resource: mof[precursorName],
              });
              if (pubchemResult) return pubchemResult;

              const sigmaResult = await molWeightDownloader.download({
                resource: mof[precursorName],
                sigma: true,
              });
              return sigmaResult;
            })();

            if (!weightFile) continue;

            const molWeight = await fs
              .readFile(weightFile)
              .then((buf) => buf.toString())
              .then((str) => parseFloat(str));
            const value = molAmount * molWeight;

            if (Number.isNaN(value))
              throw new Error(
                `Invalid molecular amount value: ${molAmount}mol * ${molWeight}`
              );

            logger.i(
              "AmountRegularizer",
              `${molAmount}mol of ${mof[precursorName]} is ${value}mg(${molAmount} * ${molWeight}).`
            );

            if (molWeight) mof[columnName] = molWeight;
          } catch (err) {
            logger.e("AmountRegularizer", `${mof[precursorName]} / ${err}`);
          }
        }

        await mof.save();
      } catch (err) {
        logger.e("AmountRegularizer", err);
      } finally {
        logger.stepTask();
      }
    }
  );
});
