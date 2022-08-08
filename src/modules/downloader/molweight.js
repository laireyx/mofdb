const path = require("path");

const Downloader = require(".");

module.exports = class MolWeightDownloader extends Downloader {
  /**
   * Get molecular weight URL from name
   * @param {Downloader.DownloadOpts} opts
   * @returns
   */
  getUrl(opts) {
    const molName = opts.resource;

    return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${molName}/property/MolecularWeight/TXT`;
  }

  /**
   * Get download path
   * @param {Downloader.DownloadOpts} opts
   * @return {string}
   */
  getDownloadPath(opts) {
    return path.join(this.downloadDir, opts.resource + ".txt");
  }
};
