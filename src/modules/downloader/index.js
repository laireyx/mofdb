/**
 * @typedef {import('../logger')} Logger
 */

const fs = require("fs/promises");
const existsSync = require("fs").existsSync;
const path = require("path");
const stream = require("stream/promises");
const { CookieJar } = require("tough-cookie");

const got = require("got").default;

/**
 * @typedef {object} DownloadOpts
 * @property {any} resource
 */
module.exports = class Downloader {
  tokenQueue = null;
  downloadInterval = 0;
  cookieJar = new CookieJar();

  /**
   * Downloader
   * @param {object} ctor
   * @param {Logger} ctor.logger
   * @param {string} ctor.downloadDir
   * @param {number} ctor.downloadInterval
   */
  constructor({
    logger,
    downloadDir = "cached",
    downloadInterval = 5000,
  } = {}) {
    this.logger = logger;
    this.downloadInterval = downloadInterval;

    this.downloadDir = downloadDir;

    try {
      fs.mkdir(this.downloadDir).catch(() => {});
    } catch (err) {}
  }

  /**
   * Get a download token
   * @return {Promise}
   */
  getToken() {
    if (!this.tokenQueue) {
      this.tokenQueue = [];
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.tokenQueue.push({ resolve, reject });
    });
  }

  /**
   * Peek the first item and start downloading
   */
  releaseToken() {
    if (this.tokenQueue.length === 0) {
      this.tokenQueue = null;
      return;
    }

    const { resolve } = this.tokenQueue.shift();
    resolve();
  }

  /**
   * Finish download and release token according to the download interval.
   */
  finishDownload() {
    // Release token after download interval
    setTimeout(
      () => this.releaseToken(),
      (1 + 0.5 * Math.random()) * this.downloadInterval
    );
  }

  /**
   * Get download URL
   * @param {DownloadOpts} downloadOpts
   * @return {object}
   */
  getUrl(downloadOpts) {
    return downloadOpts.resource;
  }

  /**
   * Get fetch option
   * @param {DownloadOpts} downloadOpts
   * @return {object}
   */
  getFetchOpts(downloadOpts) {
    return {};
  }

  /**
   * Get download file destination path
   * @param {DownloadOpts} downloadOpts
   * @return {string}
   */
  getDownloadPath(downloadOpts) {
    return path.join(this.downloadDir, downloadOpts.resource);
  }

  /**
   * Download as file using stream.pipe()
   * @param {string} url
   * @param {string} dst
   * @param {object} fetchOpts
   * @return {Promise}
   */
  async downloadAsFile(url, dst, fetchOpts) {
    const gotResponse = await got(url, {
      ...fetchOpts,
      throwHttpErrors: false,
      cookieJar: this.cookieJar,
    });

    if (gotResponse.statusCode >= 400)
      throw new Error(
        `HTTP ${gotResponse.statusCode} : ${gotResponse.statusMessage} for ${url}`
      );

    await fs.mkdir(path.dirname(dst), { recursive: true });

    return await fs.writeFile(dst, gotResponse.rawBody);
  }

  /**
   * Download file and returns its saved path
   * @param {DownloadOpts} downloadOpts
   * @return {string}
   */
  async download(downloadOpts) {
    const targetUrl = this.getUrl(downloadOpts);
    const downloadPath = this.getDownloadPath(downloadOpts);
    const fetchOpts = this.getFetchOpts(downloadOpts);

    if (!targetUrl) {
      this.logger.e(
        "Downloader",
        `Cannot find appropriate resource URL of ${downloadOpts.resource}`
      );
      return null;
    }

    await this.getToken();

    if (existsSync(downloadPath)) {
      this.releaseToken();
      return downloadPath;
    }

    try {
      await this.downloadAsFile(targetUrl, downloadPath, fetchOpts);

      this.logger.i("Downloader", `Downloaded ${downloadOpts.resource}.`);

      return downloadPath;
    } catch (err) {
      // console.error(err);
      this.logger.e(
        "Downloader",
        `Failed to download ${downloadOpts.resource}. Tried URL is ${targetUrl}`
      );

      await fs.rm(downloadPath, { force: true });

      return null;
    } finally {
      this.finishDownload();
    }
  }
};
