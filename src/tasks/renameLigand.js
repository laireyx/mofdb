const generateTask = require(".");
const DatabaseReader = require("../modules/reader/database");

const {
  MOF,
  Sequelize: { Op },
} = require("../../models");
const DoiDownloader = require("../modules/downloader/doi");
const pdfjs = require("pdfjs-dist/legacy/build/pdf");
const Regularizer = require("../modules/regularizer");

module.exports = generateTask(
  "RenameLigand",
  /**
   * Build PrecursorDB
   * @param {import('../modules/logger')} logger
   */
  async (logger) => {
    const mofReader = new DatabaseReader({
      logger,
      model: MOF,
    });

    const doiDownloader = new DoiDownloader({ logger });

    let regularizedCount = 0;

    logger.setTaskMax(
      await mofReader.estimateCount({
        order: [["doi", "ASC"]],
        where: {
          doi: {
            [Op.not]: null,
          },
        },
      })
    );

    await mofReader
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
        ) {
          logger.stepTask();
          return;
        }

        const trimmedDoi = mof.doi
          .replace(/^\s+/, "")
          .replace(/((https?:[/])?[/].*doi[.]org)[/]/, "")
          .replace(/ *;$/, ";");
        const doi = trimmedDoi.match(/\d+[.]\d+[/][^ ]*/);

        const ligands = [];
        const ligandIndices = [];

        try {
          if (!doi) {
            logger.e(
              "LigandRenamer",
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

          const pdf = await doiDownloader.download({ resource: doi[0] });

          if (!pdf) {
            return;
          }

          const parseResult = await parseLigand({
            pdf,
            ligands,
          });

          if (parseResult.every((eachLigand) => eachLigand.length === 0)) {
            logger.e("LigandRenamer", `${pdf} : Cannot find any ligand string`);
            return;
          }

          logger.i(
            "LigandRenamer",
            `${pdf}\n${JSON.stringify(parseResult, null, 2)}`
          );

          let regularize = false;

          parseResult.forEach((result, i) => {
            if (result.every((r, i) => i === 0 || r === result[i - 1])) {
              if (result[0] === "") return;
              regularize = true;
              mof[`namePrecursor${ligandIndices[i]}`] = result[0];
            }
          });

          if (regularize) regularizedCount++;

          await mof.save();
        } catch (err) {
          console.error(err);
          logger.e("LigandRenamer", `Failed parsing ${doi[0]}`);
        } finally {
          logger.stepTask();
        }
      });

    logger.i("LigandRenamer", "Regularized count: " + regularizedCount);
  }
);

async function parseLigand({ pdf = "", ligands = [] }) {
  const doc = await pdfjs.getDocument({
    url: pdf,
    verbosity: 0,
  }).promise;

  const stringRegularizer = new Regularizer();

  const matchResult = [[], [], []];

  const ligandRegexes = ligands.map((ligandStr) => {
    return new RegExp(
      "[^.;:]*?" + ["\\(", ...ligandStr.split(""), "\\)"].join("\\s*"),
      "g"
    );
  });

  for (let page = 1; page <= doc.numPages; page++) {
    const pageContent = await doc.getPage(page);
    const textStream = pageContent.streamTextContent();
    const textReader = textStream.getReader();
    let readTexts = [];
    let readResult = await textReader.read();

    while (!readResult.done) {
      Array.prototype.push.apply(
        readTexts,
        readResult.value.items.map((item) => item.str)
      );
      readResult = await textReader.read();
    }

    const fullText = readTexts.join("");

    ligandRegexes.forEach((ligandRegex, ligandIdx) => {
      const matched = fullText.match(ligandRegex);
      if (matched) {
        const trimmedString = matched[0]
          .replace(/^.*(and|of|with|by|on|the|from|the|as|two)\b/i, "")
          .replace(
            /^.*?(using|following|(metallo)?ligands?|used|selected|namely|linkers?|choose|chose|complex(es)?|formula|polymer)/g,
            ""
          )
          .replace(/\(\s*(H\s*\d*)?\s*L\s*\d*?\s*\)$/g, "")
          .replace(/^(,|\s|·)+/, "")
          .replace(/\s+$/, "");

        const regularizedString =
          stringRegularizer.regularizeString(trimmedString);

        if (regularizedString.replace(/\s/g, "").match(/^\((H\d*)?L\d*?\)$/))
          // Skip useless string
          return;
        if (regularizedString === "") return;

        matchResult[ligandIdx].push(regularizedString);
      }
    });
  }

  return matchResult;
}
