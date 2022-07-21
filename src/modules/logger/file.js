const fs = require("fs");
const path = require("path");
const Logger = require(".");

module.exports = class FileLogger extends Logger {
  /** @type {Object<string, fs.WriteStream>} */
  streams = {};

  /**
   * Filed logger
   * @param {object} ctor
   * @param {number} ctor.suppressLevel suppress log below this level
   * @param {string} ctor.logDir log file name
   */
  constructor({ suppressLevel = 0, logDir = "logs" } = {}) {
    super({ suppressLevel });
    this.logDir = logDir;

    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (err) {}
  }

  /**
   * Get a log file write stream. If not exists, create a new one.
   *
   * @param {string} tag Log tag
   * @return {fs.WriteStream}
   */
  stream(tag) {
    if (!this.streams[tag]) {
      this.streams[tag] = {
        logStream: fs.createWriteStream(path.join(this.logDir, `${tag}.log`)),
        errorStream: fs.createWriteStream(
          path.join(this.logDir, `${tag}.err.log`)
        ),
      };
    }

    return this.streams[tag];
  }

  /**
   * Build a log string
   * @param {string} level
   * @param {string} tag
   * @param {string} msg
   * @return {string}
   */
  buildLogString(level, tag, msg) {
    return `[${new Date().toLocaleString()}][${Logger.levelString[level]}]${
      msg.length > 100 ? "\n" : " "
    }${msg}`;
  }

  /**
   * Log
   * @param {string} level
   * @param {string} msg
   */
  log(level, tag, msg) {
    if (level < this.suppressLevel) return;

    const { logStream, errorStream } = this.stream(tag);

    let writeStream = logStream;
    if (level >= Logger.ERROR) {
      writeStream = errorStream;
    }

    writeStream.write(this.buildLogString(level, tag, msg) + "\n");
  }
};
