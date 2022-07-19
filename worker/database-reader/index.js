const Reader = require("../classes/reader");
/** @type {typeof import('sequelize').Model} */
const MOF = require("../../models").MOF;

class DatabaseResult {
  /**
   * Database query result
   * @param {AsyncGenerator<Array<import('sequelize').Model>,void>} query
   */
  constructor(query) {
    this.query = query;
  }

  /**
   * Make an array from the query result
   * @return {Promise<Array<import('sequelize').Model>>}
   */
  async toArray() {
    let result;
    let resultArray = [];
    while (!(result = await this.query.next()).done) {
      Array.push.apply(resultArray, result.value);
      // resultArray = resultArray.concat(result.value);
    }

    return resultArray;
  }

  /**
   * Call a function for each item from the query result
   * @param {function} cb
   * @return {Promise<Array<import('sequelize').Model>>}
   */
  async each(cb) {
    let result;
    let promises = Promise.resolve();
    while (!(result = await this.query.next()).done) {
      promises = Promise.all([promises, ...result.value.map(cb)]);
    }
    return await promises;
  }
}

module.exports = class DatabaseReader extends Reader {
  /**
   * Database Reader
   * @param {object} ctor
   * @param {import('../classes/reader').Logger} ctor.logger
   * @param {number} ctor.chunkSize
   */
  constructor({ logger, chunkSize = 1000 } = {}) {
    super({ logger });
    this.chunkSize = chunkSize;
  }

  /**
   * Read entities in MOF DB
   * @param {import('sequelize').FindOptions} queryOpts
   */
  read(queryOpts) {
    this.logger.i(
      "DatabaseReader",
      `Reading database with query option: ${JSON.stringify(queryOpts)}`
    );

    return new DatabaseResult(
      (async function* (chunkSize) {
        let offset = 0;
        let result;

        do {
          result = await MOF.findAll({
            ...queryOpts,
            offset,
            limit: chunkSize,
          });
          offset += chunkSize;

          yield result;
        } while (result.length !== 0);
      })(this.chunkSize)
    );
  }
};
