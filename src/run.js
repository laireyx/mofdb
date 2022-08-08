module.exports = async function run(args) {
  if (args.build) {
    await require("./tasks/buildPorous")();
  }

  if (args.ligand) {
    await require("./tasks/renameLigand")();
  }

  if (args.regularize) {
    await require("./tasks/regularizeString")();
  }

  if (args.molecule) {
    await require("./tasks/regularizeAmout")();
  }

  if (args.similarity) {
    await require("./tasks/similarityCheck")();
  }

  if (args.precursor) {
    await require("./tasks/buildPrecursor")();
  }
};
