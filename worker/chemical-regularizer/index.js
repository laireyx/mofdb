const Regularizer = require("../classes/regularizer");
const { Op } = require("sequelize");
const { Sequelize } = require("../../models");
const DoiDownloader = require("../doi-downloader");
const LigandParser = require("./ligand-parser");

module.exports = class ChemicalRegularizer extends Regularizer {
  constructor({ reader, logger } = {}) {
    super({ reader, logger });

    this.doiDownloader = new DoiDownloader({ logger, downloadDir: "pdfs" });
    this.ligandParser = new LigandParser();
  }

  async regularize() {
    this.logger.startTask({ name: "ChemicalRegularize" });
    let regularizedCount = 0;

    await this.reader
      .read({
        order: [["doi", "ASC"]],
        where: {
          doi: {
            [Op.not]: null,
          },
        },
      })
      .each(async (mof) => {
        if (
          !mof?.namePrecursor1?.match(/^(H\d*)?L(\d*)?$/) &&
          !mof?.namePrecursor2?.match(/^(H\d*)?L(\d*)?$/) &&
          !mof?.namePrecursor3?.match(/^(H\d*)?L(\d*)?$/)
        )
          return;
        this.logger.stepTask({ curStep: 0, maxStep: 1 });

        const trimmedDoi = mof.doi
          .replace(/^\s+/, "")
          .replace(/((https?:[/])?[/].*doi[.]org)[/]/, "")
          .replace(/ *;$/, ";");
        const doi = trimmedDoi.match(/\d+[.]\d+[/][^ ]*/);

        const ligands = [];
        const ligandIndices = [];

        try {
          if (!doi) {
            this.logger.e(
              "ChemicalRegularizer",
              `Cannot extract canonical DOI from original string ${mof.doi}`
            );
            return;
          }

          if (mof?.namePrecursor1?.match(/(H\d*)?L(\d*)?/)) {
            ligandIndices.push(1);
            ligands.push(
              mof.namePrecursor1.replace(/\s/g, "").match(/(H\d*)?L(\d*)?/)[0]
            );
          }
          if (mof?.namePrecursor2?.match(/(H\d*)?L(\d*)?/)) {
            ligandIndices.push(2);
            ligands.push(
              mof.namePrecursor2.replace(/\s/g, "").match(/(H\d*)?L(\d*)?/)[0]
            );
          }
          if (mof?.namePrecursor3?.match(/(H\d*)?L(\d*)?/)) {
            ligandIndices.push(3);
            ligands.push(
              mof.namePrecursor3.replace(/\s/g, "").match(/(H\d*)?L(\d*)?/)[0]
            );
          }
          // Cannot find legal ligand
          if (ligands.length === 0) return;

          const pdf = await this.doiDownloader.download({ resource: doi[0] });

          if (!pdf) {
            return;
          }

          const parseResult = await this.ligandParser.parse({
            pdf,
            ligands,
          });

          if (parseResult.every((eachLigand) => eachLigand.length === 0)) {
            this.logger.e(
              "ChemicalRegularizer",
              `${pdf} : Cannot find any ligand string`
            );
            return;
          }

          regularizedCount++;
          this.logger.i(
            "ChemicalRegularizer",
            `${pdf}\n${JSON.stringify(parseResult, null, 2)}`
          );

          parseResult.forEach((result, i) => {
            if (result.every((r, i) => i === 0 || r === result[i - 1])) {
              if (result[0] === "") return;
              mof[`namePrecursor${ligandIndices[i]}`] = result[0];
            }
          });

          await mof.save();
        } catch (err) {
          console.error(err);
          this.logger.e("ChemicalRegularizer", `Failed parsing ${doi[0]}`);
        } finally {
          this.logger.stepTask({ curStep: 1, maxStep: 0 });
        }
      });

    this.logger.i(
      "ChemicalRegularizer",
      "Regularized count: " + regularizedCount
    );
  }
};
