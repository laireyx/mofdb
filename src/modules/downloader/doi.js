const path = require("path");

const Downloader = require(".");

module.exports = class DoiDownloader extends Downloader {
  constructor({ logger, downloadDir = "pdfs", downloadInterval = 7000 } = {}) {
    super({ logger, downloadDir, downloadInterval });
  }
  /**
   * Get PDF URL from DOI
   * @param {Downloader.DownloadOpts} opts
   * @returns
   */
  getUrl(opts) {
    let doi = opts.resource;
    if (doi.endsWith(";")) doi = doi.replace(/;$/, "");

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
   * Get download path
   * @param {Downloader.DownloadOpts} opts
   * @return {string}
   */
  getDownloadPath(opts) {
    let doi = opts.resource;
    if (doi.endsWith(";")) doi = doi.replace(/;$/, "");

    return path.join(this.downloadDir, doi + ".pdf");
  }

  /**
   * Get crawling fetch option
   * @return {object}
   */
  getFetchOpts() {
    return {
      headers: {
        Accept: "application/pdf",
        "Wiley-TDM-Client-Token": process.env["Wiley-TDM-Client-Token"],
        "X-ELS-APIKey": process.env["X-ELS-APIKey"],
      },
    };
  }
};
