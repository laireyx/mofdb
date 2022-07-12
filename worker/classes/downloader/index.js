/**
 * @typedef {import('../logger')} Logger
 */

module.exports = class Downloader {
  /**
   * Downloader
   * @param {object} ctor
   * @param {Logger} ctor.logger
   */
  constructor({ logger } = {}) {
    this.logger = logger;
  }

  async download({ resource }) {}
};
