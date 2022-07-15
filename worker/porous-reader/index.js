const fs = require("fs/promises");
const { createReadStream } = require("fs");
const path = require("path");
const readline = require("readline");

const Reader = require("../classes/reader");

/** @type {typeof import('sequelize').Model} */
const MOF = require("../../models").MOF;

module.exports = class PorousReader extends Reader {
  /**
   * Reader
   * @param {object} ctor
   * @param {string[]} ctor.workDir
   * @param {Logger} ctor.logger
   * @param {boolean} [ctor.buildDb=false]
   */
  constructor({ workDir, logger, buildDb = false } = {}) {
    super({ logger });
    this.workDir = workDir;
    this.buildDb = buildDb;
  }

  readDataFile(file, porousObj) {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: createReadStream(file),
      });

      const lineRegex = file.includes("Paper")
        ? /^([^=]+)=(.+)$/
        : /^=?([^\s]+) (.+)$/;

      rl.on("line", (eachLine) => {
        const matchResult = eachLine.match(lineRegex);
        if (!matchResult) return;
        const [_, key, val] = matchResult;

        const camelCasedKey = key
          .toLowerCase()
          .replace(/_(.)/g, (_, char) => char.toUpperCase());
        porousObj[camelCasedKey] = val;
      });

      rl.on("close", () => {
        resolve();
      });
    });
  }

  /**
   * Read each porous database object
   * @param {object} path
   * @param {string} path.workDir
   * @param {string} path.porous
   * @return {Promise}
   */
  async readEachPorous({ workDir, porous } = {}) {
    const dir = path.join(workDir, porous);

    this.logger.i("Reader", `Reading dir: ${porous}`);
    const porousContents = await fs.readdir(dir);

    const porousObj = {};

    if (!porousContents.some((name) => name.includes("Materials"))) {
      this.logger.e("Reader", `${porous} No materials info`);
      return;
    }

    await Promise.all(
      porousContents.map((porousFile) =>
        this.readDataFile(path.join(dir, porousFile), porousObj)
      )
    );

    try {
      if (!porousObj.name) throw new Error(`No name`);
      if (this.buildDb) await MOF.create(porousObj);
    } catch (err) {
      this.logger.e("Reader", `${porous} ${err.message}`);
    }
  }

  async read({} = {}) {
    this.logger.startTask({ name: "Reading PorousDB" });

    await Promise.all(
      this.workDir.map(async (dir) => {
        const porouses = await fs.readdir(dir);
        this.logger.stepTask({ curStep: 0, maxStep: porouses.length });

        await Promise.all(
          porouses.map(async (porous) => {
            await this.readEachPorous({ workDir: dir, porous });
            this.logger.stepTask();
          })
        );
      })
    );
  }
};
