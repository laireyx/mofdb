const fs = require("fs/promises");
const { createReadStream } = require("fs");
const path = require("path");
const readline = require("readline");

const Reader = require(".");

module.exports = class PorousReader extends Reader {
  /**
   * Reader
   * @param {object} ctor
   * @param {string[]} ctor.workDir
   * @param {import('../logger')} ctor.logger
   */
  constructor({ workDir, logger } = {}) {
    super({ logger });
    this.workDir = workDir;
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
      return porousObj;
    } catch (err) {
      this.logger.e("Reader", `${porous} ${err.message}`);
      return null;
    }
  }

  async *generate() {
    for (const dir of this.workDir) {
      const porouses = await fs.readdir(dir);

      for (const porous of porouses) {
        const readResult = await this.readEachPorous({ workDir: dir, porous });
        if (!readResult) continue;
        yield [readResult];
      }
    }
  }

  read({} = {}) {
    return new Reader.ReadResult(this.generate());
  }

  async estimateCount() {
    let count = 0;
    for (const dir of this.workDir) {
      const porouses = await fs.readdir(dir);
      count += porouses.length;
    }

    return count;
  }
};
