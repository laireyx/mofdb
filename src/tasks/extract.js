const generateTask = require(".");
const DatabaseReader = require("../modules/reader/database");

const { MOF } = require("../../models");
const NgramExtracter = require("../modules/extracter/ngram");

module.exports = generateTask(
  "Extract",
  /**
   * Build PrecursorDB
   * @param {import('../modules/logger')} logger
   */
  async function (logger) {
    const NGRAM_N = 100;
    const MINIMUM_N = 4;
    const MINIMUM_FREQ = 5;
    const THRESHOLD = 0.95;

    const mofReader = new DatabaseReader({
      logger,
      model: MOF,
    });

    const extracter = new NgramExtracter({
      logger,
      nGramsCount: NGRAM_N,
      minimumN: MINIMUM_N,
    });

    logger.addTaskMax(await mofReader.estimateCount());

    /** @type {Map<string,number>[]} */
    const nGrams = [];
    for (let n = MINIMUM_N; n <= NGRAM_N; n++) {
      const map = new Map();
      map[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
      };

      nGrams[n] = map;
    }

    await mofReader.read().each(async (mof) => {
      logger.stepTask();
      const extractResult = extracter.extract(mof);
      extractResult.forEach((extractedNgrams, n) => {
        extractedNgrams.forEach((ngram) => {
          const val = nGrams[n].get(ngram) ?? 0;
          nGrams[n].set(ngram, val + 1);
        });
      });
    });

    const deleteNgrams = [];

    for (let n = NGRAM_N; n >= MINIMUM_N + 1; n--) {
      for (const [ngram, freq] of nGrams[n]) {
        if (freq <= MINIMUM_FREQ) continue;

        // Remove subgrams
        const ngramPriority = freq * n;

        for (let _n = n - 1; _n >= MINIMUM_N; _n--) {
          for (let j = 0; j <= n - _n; j++) {
            const subgram = ngram.substring(j, j + _n);

            const subgramFreq = nGrams[_n].get(subgram) ?? 0;
            const subgramPriority = subgramFreq * _n;
            if (subgramPriority < ngramPriority * THRESHOLD) {
              deleteNgrams.push(subgram);
            }

            if (ngramPriority < subgramPriority * THRESHOLD) {
              deleteNgrams.push(ngram);
              break;
            }
          }
        }
      }
    }

    deleteNgrams.forEach((ngram) => {
      nGrams[ngram.length].delete(ngram);
    });

    for (let n = NGRAM_N; n >= MINIMUM_N; n--) {
      for (const [ngram, freq] of nGrams[n]) {
        if (freq <= MINIMUM_FREQ) continue;
        // get data sorted
        logger.i("Extract", `${ngram}=${freq}`);
      }
    }
  }
);
