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
parser.add_argument("-p", "--precursor", {
  action: "store_true",
  help: "Regularize Precursor",
});

require("./run")(parser.parse_args());
