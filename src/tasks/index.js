/** @typedef {import('../modules/logger')} Logger */

const FileLogger = require("../modules/logger/file");

/**
 * @callback TaskCallback
 * @param {Logger} arg
 * @return {Promise}
 */

class TaskManager {
  static logger = new FileLogger();

  /**
   *
   * @param {string} taskName
   * @param {TaskCallback} task
   * @returns {function}
   */
  static generateTask(taskName, task) {
    return async () => {
      TaskManager.logger.startTask({ name: taskName });
      return await task(TaskManager.logger);
    };
  }
}

module.exports = TaskManager.generateTask;
