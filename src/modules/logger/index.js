const process = require("process");

module.exports = class Logger {
  static VERBOSE = 0;
  static INFO = 1;
  static DEBUG = 2;
  static WARNING = 3;
  static ERROR = 4;

  static levelString = "VIDWE";

  task = {
    name: "",
    progress: { max: 0, current: 0 },
  };

  progressLog = {
    prevTask: 0,
    prevDate: 0,
  };

  /**
   * General logger
   * @param {object} ctor
   * @param {number} ctor.suppressLevel suppress log below this level
   */
  constructor({ suppressLevel = Logger.VERBOSE } = {}) {
    this.suppressLevel = suppressLevel;
  }

  /**
   * Build a log string
   * @param {string} level
   * @param {string} tag
   * @param {string} msg
   * @return {string}
   */
  buildLogString(level, tag, msg) {
    return `[${new Date().toLocaleString()}][${
      Logger.levelString[level]
    }/${tag}] ${msg}`;
  }

  /**
   * Log
   * @param {string} level
   * @param {string} tag
   * @param {string} msg
   */
  log(level, tag, msg) {
    if (level < this.suppressLevel) return;
    console.log(this.buildLogString(level, tag, msg));
  }

  /**
   * Start a new task logging
   * @param {object} task
   * @param {string} task.name
   * @param {number} task.max
   */
  startTask({ name = "Dummy task", max = 0 } = {}) {
    if (this.task.progress.max !== this.task.progress.current)
      process.stdout.write("\n");

    this.task.name = name;

    this.task.progress.max = Math.max(max, 0);
    this.task.progress.current = 0;

    this.progressLog.prevTask = 0;
    this.progressLog.prevDate = Date.now();

    this.printTask();
  }

  /**
   * Set a maximum task progress
   * @param {number} max
   */
  setTaskMax(max) {
    this.task.progress.max = max;
  }

  /**
   * Add a maximum task progress
   * @param {number} max
   */
  addTaskMax(max) {
    this.task.progress.max += max;
  }

  /**
   * Step a task logging
   * @param {object} taskStep
   * @param {number} taskStep.curStep
   * @param {number} taskStep.maxStep
   */
  stepTask({ curStep = 1, maxStep = 0 } = {}) {
    this.task.progress.current += curStep;
    this.task.progress.max += maxStep;
  }

  /**
   * Print a task logging
   */
  printTask() {
    const taskRate = this.task.progress.max
      ? this.task.progress.current / this.task.progress.max
      : 0;
    const progressPerSeconds =
      (this.task.progress.current - this.progressLog.prevTask) /
      ((Date.now() - this.progressLog.prevDate) / 1000);
    const ETA = ~~(progressPerSeconds > 0
      ? (this.task.progress.max - this.task.progress.current) /
        progressPerSeconds
      : 9e9);

    process.stdout.cursorTo(0);
    process.stdout.write(`[\x1b[32m${this.task.name}\x1b[0m]`);

    process.stdout.write(`[`);
    for (let i = 0; i < 20; i++) {
      if (i / 20 < taskRate) {
        process.stdout.write(`\x1b[7m.`);
      } else {
        process.stdout.write(`\x1b[0m.`);
      }
    }
    process.stdout.write(`\x1b[0m]`);

    process.stdout.write(
      `[${this.task.progress.current}/${this.task.progress.max}(${
        ~~(taskRate * 10000) / 100
      }%)]`
    );
    process.stdout.write(
      ` ETA ${~~(ETA / 3600)}h ${~~((ETA % 3600) / 60)
        .toString()
        .padStart(2, " ")}m ${(ETA % 60).toString().padStart(2, " ")}s`
    );
    process.stdout.clearLine(1);

    this.progressLog.prevTask = this.task.progress.current;
    this.progressLog.prevDate = Date.now();

    if (
      this.task.progress.max === 0 ||
      this.task.progress.max !== this.task.progress.current
    )
      setTimeout(() => this.printTask(), 1000);
  }

  /**
   * Verbose
   * @param {string} tag
   * @param {string} msg
   */
  v(tag, msg) {
    this.log(Logger.VERBOSE, tag, msg);
  }

  /**
   * Info
   * @param {string} tag
   * @param {string} msg
   */
  i(tag, msg) {
    this.log(Logger.INFO, tag, msg);
  }

  /**
   * Debug
   * @param {string} tag
   * @param {string} msg
   */
  d(tag, msg) {
    this.log(Logger.DEBUG, tag, msg);
  }

  /**
   * Warning
   * @param {string} tag
   * @param {string} msg
   */
  w(tag, msg) {
    this.log(Logger.WARNING, tag, msg);
  }

  /**
   * Error
   * @param {string} tag
   * @param {string} msg
   */
  e(tag, msg) {
    this.log(Logger.ERROR, tag, msg);
  }
};
