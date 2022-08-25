const generateTask = require(".");
const DatabaseReader = require("../modules/reader/database");

const { MOF, SemanticUnit } = require("../../models");

const NgramExtracter = require("../modules/extracter/ngram");

module.exports = generateTask(
  "Extract",
  /**
   * Build PrecursorDB
   * @param {import('../modules/logger')} logger
   */
  async function (logger) {
    const NGRAM_N = 100;

    const MINIMUM_N = 3;
    const MINIMUM_PRIORITY = 100;

    const LENGTH_PRIORITY = 1;

    const THRESHOLD_SUBGRAM = 0.8;
    const THRESHOLD_SUPERGRAM = 1;

    const mofReader = new DatabaseReader({
      logger,
      model: MOF,
    });

    const extracter = new NgramExtracter({
      logger,
      nGramsCount: NGRAM_N,
      minimumN: MINIMUM_N,
    });

    await SemanticUnit.truncate();

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

    const deleteNgrams = new Set();

    for (let n = NGRAM_N; n >= MINIMUM_N + 1; n--) {
      for (const [ngram, freq] of nGrams[n]) {
        if (freq * n ** LENGTH_PRIORITY <= MINIMUM_PRIORITY) continue;

        // Remove subgrams
        const ngramPriority = freq * n ** LENGTH_PRIORITY;

        for (let _n = n - 1; _n >= MINIMUM_N; _n--) {
          for (let j = 0; j <= n - _n; j++) {
            const subgram = ngram.substring(j, j + _n);

            const subgramFreq = nGrams[_n].get(subgram) ?? 0;
            const subgramPriority = subgramFreq * _n ** LENGTH_PRIORITY;

            if (ngramPriority < subgramPriority * THRESHOLD_SUPERGRAM) {
              deleteNgrams.add(ngram);
              break;
            }

            if (subgramPriority < ngramPriority * THRESHOLD_SUBGRAM) {
              deleteNgrams.add(subgram);
            }
          }
        }
      }
    }

    deleteNgrams.forEach((ngram) => {
      nGrams[ngram.length].delete(ngram);
    });

    let suid = 0;
    for (let n = NGRAM_N; n >= MINIMUM_N; n--) {
      for (const [ngram, freq] of nGrams[n]) {
        if (freq * n ** LENGTH_PRIORITY <= MINIMUM_PRIORITY) continue;
        // get data sorted
        logger.i("Extract", `${ngram}=${freq}`);

        await SemanticUnit.create({
          name: ngram,
          suid,
        });

        suid++;
      }
    }
  }
);
