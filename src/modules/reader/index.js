/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('../logger')} Logger
 */

/**
 * @callback ReaderCallback
 * @param {any} arg
 * @return {Promise}
 */

class ReadResult {
  /**
   * Read result
   * @param {AsyncGenerator<any[],void>} generator
   */
  constructor(generator) {
    this.generator = generator;
  }

  /**
   * Make an array from the read result
   * @return {Promise<any[]>}
   */
  async toArray() {
    let result;
    let resultArray = [];
    while (!(result = await this.generator.next()).done) {
      resultArray = resultArray.concat(result.value);
    }

    return resultArray;
  }

  /**
   * Call a function for each item from the read result
   * @param {ReaderCallback} cb
   * @return {Promise}
   */
  async each(cb) {
    let result;
    while (!(result = await this.generator.next()).done) {
      await Promise.all(result.value.map(cb));
    }
  }

  /**
   * Call a function for each item from the read result sequentially
   * @param {ReaderCallback} cb
   * @return {Promise<any[]>}
   */
  async sequentialEach(cb) {
    let result;
    while (!(result = await this.generator.next()).done) {
      for (let i = 0; i < result.value.length; i++) {
        await cb(result.value[i]);
      }
    }
  }
}

module.exports = class Reader {
  /**
   * Reader
   * @param {object} ctor
   * @param {string} ctor.workDir
   * @param {Logger} ctor.logger
   */
  constructor({ workDir, logger } = {}) {
    this.workDir = workDir;
    this.logger = logger;
  }

  /**
   * @yields {any[]}
   */
  async *generate() {
    yield [];
  }

  /**
   * Read entities
   * @return {ReadResult}
   */
  read() {
    return new ReadResult(this.generate());
  }

  /**
   * @return {Promise<number>}
   */
  async estimateCount() {
    return 0;
  }
};
module.exports.ReadResult = ReadResult;
