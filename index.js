// environment variables
require("dotenv").config();

const { ArgumentParser } = require("argparse");

const parser = new ArgumentParser();

parser.add_argument("-b", "--build", {
  action: "store_true",
  help: "Build database",
});
parser.add_argument("-l", "--ligand", {
  action: "store_true",
  help: "Rename Ligand",
});
parser.add_argument("-r", "--string", {
  action: "store_true",
  help: "Regularize String",
});
parser.add_argument("-p", "--precursor", {
  action: "store_true",
  help: "Build Precursor database",
});
parser.add_argument("-s", "--similarity", {
  action: "store_true",
  help: "Similarity analysis for precursors",
});

require("./src/run")(parser.parse_args());
