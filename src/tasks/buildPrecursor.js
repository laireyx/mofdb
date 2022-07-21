const generateTask = require(".");
const DatabaseReader = require("../modules/reader/database");

const {
  MOF,
  Precursor,
  sequelize,
  Sequelize: { Op },
} = require("../../models");

module.exports = generateTask(
  "BuildPrecursor",
  /**
   * Build PrecursorDB
   * @param {import('../modules/logger')} logger
   */
  async function (logger) {
    const mofReader = new DatabaseReader({
      logger,
      model: MOF,
    });

    for (let precursorIdx = 1; precursorIdx <= 3; precursorIdx++) {
      const columnName = `namePrecursor${precursorIdx}`;

      logger.addTaskMax(
        await mofReader.estimateCount({
          distinct: true,
          col: columnName,
          where: { [columnName]: { [Op.ne]: null } },
        })
      );
    }

    for (let precursorIdx = 1; precursorIdx <= 3; precursorIdx++) {
      const columnName = `namePrecursor${precursorIdx}`;
      const queryOpts = {
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col(columnName)), columnName],
        ],
        where: { [columnName]: { [Op.ne]: null } },
        order: [
          [sequelize.fn("CHAR_LENGTH", sequelize.col(columnName)), "DESC"],
        ],
      };

      await mofReader.read(queryOpts).sequentialEach(async (mof) => {
        const precursorName = mof[columnName];

        try {
          const existingCheck = await Precursor.findOne({
            where: {
              name: precursorName,
            },
          });

          if (!existingCheck) {
            await Precursor.create({
              name: precursorName,
            });
          }
        } catch (err) {
          logger.e("PrecursorReader", err);
        } finally {
          logger.stepTask();
        }
      });
    }
  }
);
