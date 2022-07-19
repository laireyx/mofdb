const { Op } = require("sequelize");
const Reader = require("../classes/reader");
const DatabaseReader = require("../database-reader");

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
        .each(async (mof) => {
          const precursorName = mof[columnName];

          this.logger.stepTask({ curStep: 0, maxStep: 1 });

          try {
            const existingCheck = await this.Precursor.findOne({
              where: {
                name: precursorName,
              },
            });

            if (!existingCheck)
              await this.Precursor.create({
                name: precursorName,
              });
          } catch (err) {
            this.logger.e("PrecursorReader", err);
          } finally {
            this.logger.stepTask();
          }
        });
    }

    await precursorReader.read().each(async (precursor) => {
      const biggerCheck = await this.Precursor.findOne({
        where: {
          name: {
            [Op.like]: `%${precursor.name}%`,
            [Op.ne]: precursor.name,
          },
        },
        order: [
          mofReader.sequelize.fn(
            "CHAR_LENGTH",
            mofReader.sequelize.col("name")
          ),
        ],
      });

      precursor.biggerId = biggerCheck?.id;

      if (precursor.biggerId) {
        await precursor.save();
      }
    });
  }
};
