const fs = require("fs");
const stream = require("stream/promises");
const got = require("got").default;

(async () => {
  try {
    await stream.pipe(
      await got("http://laireyx.net/error", {
        isStream: true,
      }),
      fs.createWriteStream("test.txt")
    );
  } catch (err) {}

  console.log("Ok here");
})();
