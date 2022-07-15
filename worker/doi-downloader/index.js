const fs = require("fs/promises");
const existsSync = require("fs").existsSync;
const path = require("path");

const Downloader = require("../classes/downloader");
const download = require("download");

const { CookieJar } = require("tough-cookie");

module.exports = class DoiDownloader extends Downloader {
  constructor({ logger, downloadDir = "pdfs", downloadInterval = 7000 }) {
    super({ logger });

    this.cookieJar = new CookieJar();
    this.downloadDir = downloadDir;
    this.downloadInterval = downloadInterval;

    this.tokenQueue = null;

    try {
      fs.mkdir(this.downloadDir).catch(() => {});
    } catch (err) {}
  }

  /**
   * Download pdf of resource(doi)
   * @param {object} download
   * @param {string} download.resource
   */
  async download({ resource = "" } = {}) {
    if (resource.endsWith(";")) resource = resource.replace(/;$/, "");

    const downloadPath = path.join(this.downloadDir, resource + ".pdf");
    if (existsSync(downloadPath)) {
      this.logger.i(
        "DoiDownloader",
        `Already downloaded ${resource}. Skip downloading this file`
      );
      return downloadPath;
    }

    return await this.downloadPDF(resource);
  }

  /**
   * Get PDF URL from DOI
   * @param {string} doi
   * @returns
   */
  getPdfUrl(doi) {
    let [_, site, additional] = doi.match(/(\d+.\d+)[/](.*)/);
    if (site.startsWith("0")) site = "1" + site;
    if (!additional) return null;

    switch (site) {
      case "10.1002":
        return `https://api.wiley.com/onlinelibrary/tdm/v1/articles/${encodeURIComponent(
          doi
        )}`;
      case "10.1007":
        return `https://link.springer.com/content/pdf/${doi}.pdf`;
      case "10.1016":
        return `https://api.elsevier.com/content/article/doi/${doi}`;
      case "10.1021":
        // return null;
        return `https://pubs.acs.org/doi/pdf/${doi}`;
      case "10.1038":
        return `https://www.nature.com/articles/${additional}.pdf`;
      case "10.1039":
        return `https://pubs.rsc.org/en/content/articlepdf/2002/nj/${additional}`;
    }
    return null;
  }

  /**
   * Download PDF file using DOI.
   * @param {string} doi
   * @return {Promise}
   */
  async downloadPDF(doi) {
    const pdfUrl = this.getPdfUrl(doi);
    const downloadPath = path.join(this.downloadDir, `${doi}.pdf`);

    if (!pdfUrl) {
      this.logger.e(
        "DoiDownloader",
        `Cannot find appropriate PDF URL of DOI ${doi}`
      );
      return null;
    }

    await this.getToken();
    if (existsSync(downloadPath)) {
      this.releaseToken();
      return downloadPath;
    }
    this.logger.i("DoiDownloader", `Start download PDF of ${doi}`);

    try {
      await download(pdfUrl, this.downloadDir, {
        cookieJar: this.cookieJar,
        headers: {
          Accept: "application/pdf",
          "Wiley-TDM-Client-Token": process.env["Wiley-TDM-Client-Token"],
          "X-ELS-APIKey": process.env["X-ELS-APIKey"],
        },
        filename: `${doi}.pdf`,
      });
    } catch (err) {
      console.error(err);
      this.logger.e(
        "DoiDownloader",
        `Failed to download PDF of ${doi}. Tried URL is ${pdfUrl}`
      );
      return null;
    } finally {
      // Release token after download interval
      setTimeout(
        () => this.releaseToken(),
        this.downloadInterval + Math.random() * 3000
      );
    }

    return path.join(this.downloadDir, `${doi}.pdf`);
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
};
