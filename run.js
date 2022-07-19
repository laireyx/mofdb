/** @typedef {typeof import('sequelize').Model} Model */

const FileLogger = require("./worker/file-logger");
const PorousReader = require("./worker/porous-reader");
const DatabaseReader = require("./worker/database-reader");
const ChemicalRegularizer = require("./worker/chemical-regularizer");
const StringRegularizer = require("./worker/string-regularizer");
const PrecursorReader = require("./worker/precursor-reader");
/** @type {Model} */
const MOF = require("./models").MOF;
/** @type {Model} */
const Precursor = require("./models").Precursor;

module.exports = async function run(args) {
  const fileLogger = new FileLogger();
  if (args.database) {
    const porousReader = new PorousReader({
      workDir: [
        "./data/1st_only_text/1st/Porous_set_1.0.0/Porous_DB_1.0.0",
        "./data/2nd_1.0_only_text/2nd_1.0/Porous_DB_1.0.0/Porous_DB_1.0.0",
      ],
      logger: fileLogger,
      MOF,
    });

    await porousReader.read();
  }

  if (args.chemical) {
    const databaseReader = new DatabaseReader({
      logger: fileLogger,
      model: MOF,
    });
    const regularizer = new ChemicalRegularizer({
      logger: fileLogger,
      reader: databaseReader,
    });

    await regularizer.regularize();
  }

  if (args.string) {
    const databaseReader = new DatabaseReader({
      logger: fileLogger,
      model: MOF,
    });
    const regularizer = new StringRegularizer({
      logger: fileLogger,
      reader: databaseReader,
    });
    await regularizer.regularize();
  }

  if (args.precursor) {
    const precursorReader = new PrecursorReader({
      logger: fileLogger,
      MOF,
      Precursor,
    });

    await precursorReader.read();
  }
};
