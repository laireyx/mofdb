module.exports = async function run(args) {
  if (args.build) {
    await require("./tasks/buildPorous")();
  }

  if (args.ligand) {
    await require("./tasks/renameLigand")();
  }

  if (args.string) {
    await require("./tasks/regularizeString")();
  }

  if (args.precursor) {
    await require("./tasks/buildPrecursor")();
  }

  if (args.similarity) {
    await require("./tasks/similarityCheck")();
  }
};
