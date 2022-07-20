const { Op } = require("sequelize");
const Reader = require("../classes/reader");
const DatabaseReader = require("../database-reader");
const stringSimilarity = require("string-similarity");

module.exports = class PrecursorReader extends Reader {
  /**
   * Reader
   * @param {object} ctor
   * @param {string[]} ctor.workDir
   * @param {import('../classes/logger')} ctor.logger
   * @param {typeof import('sequelize').Model} ctor.MOF
   * @param {typeof import('sequelize').Model} ctor.Precursor
   */
  constructor({ workDir, logger, MOF, Precursor } = {}) {
    super({ logger });
    this.workDir = workDir;
    this.MOF = MOF;
    this.Precursor = Precursor;
  }

  async read() {
    this.logger.startTask({ name: "PrecursorRead" });

    const mofReader = new DatabaseReader({
      logger: this.logger,
      model: this.MOF,
    });

    const precursorReader = new DatabaseReader({
      logger: this.logger,
      model: this.Precursor,
    });

    for (let precursorIdx = 1; precursorIdx <= 3; precursorIdx++) {
      const columnName = `namePrecursor${precursorIdx}`;

      await mofReader
        .read({
          attributes: [
            [
              mofReader.sequelize.fn(
                "DISTINCT",
                mofReader.sequelize.col(columnName)
              ),
              columnName,
            ],
          ],
          where: {
            [columnName]: {
              [Op.ne]: null,
            },
          },
          order: [
            [
              mofReader.sequelize.fn(
                "CHAR_LENGTH",
                mofReader.sequelize.col(columnName)
              ),
              "DESC",
            ],
          ],
        })
        .sequentialEach(async (mof) => {
          const precursorName = mof[columnName];

          try {
            const existingCheck = await this.Precursor.findOne({
              where: {
                name: precursorName,
              },
            });

            if (!existingCheck) {
              await this.Precursor.create({
                name: precursorName,
              });
            }
          } catch (err) {
            this.logger.e("PrecursorReader", err);
          }
        });
    }

    const precursors = await precursorReader
      .read()
      .toArray()
      .then((arr) => arr.map((precursor) => precursor.name));

    this.logger.stepTask({ curStep: 0, maxStep: precursors.length });

    for (let i = 0; i < precursors.length; i++) {
      this.logger.stepTask();
      for (let j = i + 1; j < precursors.length; j++) {
        const similarity = stringSimilarity.compareTwoStrings(
          precursors[i],
          precursors[j]
        );
        if (similarity > 0.95) {
          this.logger.i(
            "PrecursorReader",
            `Similar string detected(${similarity})\n${precursors[i]}\n${precursors[j]}`
          );
        }
      }

      // For update log
      await new Promise((resolve, reject) => {
        setImmediate(() => resolve());
      });
    }
  }
};
