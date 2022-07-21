/**
 * @typedef {import('sequelize').Model} Model
 * @typedef {import('sequelize').FindOptions} FindOptions
 * @typedef {import('sequelize').CountOptions} CountOptions
 * @typedef {import('../logger')} Logger
 */

/**
 * @callback DatabaseCallback
 * @param {Model} arg
 * @return {Promise}
 */

const Reader = require(".");

class DatabaseReadResult extends Reader.ReadResult {
  /**
   * Database query result
   * @param {AsyncGenerator<Model[],void>} query
   */
  constructor(generator) {
    super(generator);
  }

  /**
   * Make an array from the query result
   * @return {Promise<Model[]>}
   */
  async toArray() {
    return super.toArray();
  }

  /**
   * Call a function for each item from the query result
   * @param {DatabaseCallback} cb
   * @return {Promise}
   */
  async each(cb) {
    return super.each(cb);
  }

  /**
   * Call a function for each item from the query result sequentially
   * @param {DatabaseCallback} cb
   * @return {Promise<Model[]>}
   */
  async sequentialEach(cb) {
    return super.sequentialEach(cb);
  }
}

module.exports = class DatabaseReader extends Reader {
  /**
   * Database Reader
   * @param {object} ctor
   * @param {Logger} ctor.logger
   * @param {typeof import('sequelize').Model} ctor.model
   * @param {number} ctor.chunkSize
   */
  constructor({ logger, model, chunkSize = 1000 } = {}) {
    super({ logger });
    this.sequelize = require("../../../models").sequelize;
    this.model = model;
    this.chunkSize = chunkSize;
  }

  async *generate(queryOpts) {
    let offset = 0;
    let result;

    do {
      result = await this.model.findAll({
        ...queryOpts,
        offset,
        limit: this.chunkSize,
      });
      offset += this.chunkSize;

      yield result;
    } while (result.length !== 0);
  }

  /**
   * Read entities in MOF DB
   * @param {FindOptions} queryOpts
   * @return {DatabaseReadResult}
   */
  read(queryOpts) {
    this.logger.i(
      "DatabaseReader",
      `Reading database with query option: ${JSON.stringify(queryOpts)}`
    );

    return new DatabaseReadResult(this.generate(queryOpts));
  }

  /**
   * Count query result
   * @param {CountOptions} query
   * @return {Promise<number>}
   */
  async estimateCount(query) {
    return await this.model.count(query);
  }
};
