// environment variables
require("dotenv").config();

const FileLogger = require("./worker/file-logger");
const PorousReader = require("./worker/porous-reader");
const DatabaseReader = require("./worker/database-reader");
const ChemicalRegularizer = require("./worker/chemical-regularizer");
const LigandParser = require("./worker/chemical-regularizer/ligand-parser");
const StringRegularizer = require("./worker/string-regularizer");

const fileLogger = new FileLogger();

const porousReader = new PorousReader({
  // workDir: "./data/1st_only_text/1st/Porous_set_1.0.0/Porous_DB_1.0.0",
  workDir: "./data/2nd_1.0_only_text/2nd_1.0/Porous_DB_1.0.0/Porous_DB_1.0.0",
  logger: fileLogger,
  buildDb: true,
});

// porousReader.read();

const databaseReader = new DatabaseReader({ logger: fileLogger });
// const regularizer = new ChemicalRegularizer({
//   logger: fileLogger,
//   reader: databaseReader,
// });

const regularizer = new StringRegularizer({
  logger: fileLogger,
  reader: databaseReader,
});

regularizer.regularize();
