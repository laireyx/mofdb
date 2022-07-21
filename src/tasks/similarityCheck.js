const stringSimilarity = require("string-similarity");
const DatabaseReader = require("../modules/reader/database");

const generateTask = require(".");

/** @type {Model} */
const Precursor = require("../../models").Precursor;

module.exports = generateTask("StringRegularize", async (logger) => {
  const precursorReader = new DatabaseReader({
    logger,
    model: Precursor,
  });

  const precursors = await precursorReader
    .read()
    .toArray()
    .then((arr) => arr.map((precursor) => precursor.name));

  logger.setTaskMax(precursors.length);

  for (let i = 0; i < precursors.length; i++) {
    logger.stepTask();
    for (let j = i + 1; j < precursors.length; j++) {
      const similarity = stringSimilarity.compareTwoStrings(
        precursors[i],
        precursors[j]
      );
      if (similarity > 0.95) {
        logger.i(
          "PrecursorReader",
          `Similar string detected(${similarity})\n${precursors[i]}\n${precursors[j]}`
        );
      }
    }

    // For update log
    await new Promise((resolve, reject) => {
      setImmediate(() => resolve());
    });
  }
});
