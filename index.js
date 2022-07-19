// environment variables
require("dotenv").config();

const { ArgumentParser } = require("argparse");

const parser = new ArgumentParser();

parser.add_argument("-b", "--build", {
  action: "store_true",
  help: "Build database",
});
parser.add_argument("-c", "--chemical", {
  action: "store_true",
  help: "Regularize Chemical",
});
parser.add_argument("-s", "--string", {
  action: "store_true",
  help: "Regularize String",
});

const args = parser.parse_args();

const FileLogger = require("./worker/file-logger");
const PorousReader = require("./worker/porous-reader");
const DatabaseReader = require("./worker/database-reader");
const ChemicalRegularizer = require("./worker/chemical-regularizer");
const StringRegularizer = require("./worker/string-regularizer");

const fileLogger = new FileLogger();
const databaseReader = new DatabaseReader({ logger: fileLogger });

(async () => {
  if (args.database) {
    const porousReader = new PorousReader({
      workDir: [
        "./data/1st_only_text/1st/Porous_set_1.0.0/Porous_DB_1.0.0",
        "./data/2nd_1.0_only_text/2nd_1.0/Porous_DB_1.0.0/Porous_DB_1.0.0",
      ],
      logger: fileLogger,
      buildDb: true,
    });

    await porousReader.read();
  }

  if (args.chemical) {
    const regularizer = new ChemicalRegularizer({
      logger: fileLogger,
      reader: databaseReader,
    });

    await regularizer.regularize();
  }

  if (args.string) {
    const regularizer = new StringRegularizer({
      logger: fileLogger,
      reader: databaseReader,
    });
    await regularizer.regularize();
  }
})();
