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
  help: "Rename ligand",
});
parser.add_argument("-r", "--regularize", {
  action: "store_true",
  help: "Regularize string",
});
parser.add_argument("-m", "--molecule", {
  action: "store_true",
  help: "Fill molecular weight",
});
parser.add_argument("-s", "--similarity", {
  action: "store_true",
  help: "Similarity analysis for precursors",
});
parser.add_argument("-p", "--precursor", {
  action: "store_true",
  help: "Build precursor database",
});
parser.add_argument("-e", "--extract", {
  action: "store_true",
  help: "Extract tokens",
});

require("./src/run")(parser.parse_args());
