const pdfjs = require("pdfjs-dist/legacy/build/pdf");

module.exports = class LigandParser {
  constructor() {}

  regularizeString(str) {
    return str
      .trim()
      .replace(/\u0001-\u0002/g, "")
      .replace(/\s?([·,\-'/()/\[\]\{\}])\s?/g, "·")
      .replace(/(?<!\d) ?(\d+) ?(?!\d)/g, "$1")
      .replace(/\s+/g, " ")
      .replace(/[′’]/g, "'")
      .replace(/[·•×\$]+/g, "·")
      .replace(/[\-–]+/g, "-")
      .replace(/^[,·\-\s]+/g, "") // TrimStart
      .replace(/[,·\-\s]+$/g, "") // TrimEnd
      .replace(/cyclo/gi, "cyclo"); // Capital letters
  }

  async parse({ pdf = "", ligands = [] }) {
    const doc = await pdfjs.getDocument({
      url: pdf,
      verbosity: 0,
    }).promise;

    const matchResult = [[], [], []];

    const ligandRegexes = ligands.map((ligandStr) => {
      return new RegExp(
        "[^.;:]*?" + ["\\(", ...ligandStr.split(""), "\\)"].join("\\s*"),
        "g"
      );
    });

    for (let page = 1; page <= doc.numPages; page++) {
      const pageContent = await doc.getPage(page);
      const textStream = pageContent.streamTextContent();
      const textReader = textStream.getReader();
      let readTexts = [];
      let readResult = await textReader.read();

      while (!readResult.done) {
        Array.prototype.push.apply(
          readTexts,
          readResult.value.items.map((item) => item.str)
        );
        readResult = await textReader.read();
      }

      const fullText = readTexts.join("");

      ligandRegexes.forEach((ligandRegex, ligandIdx) => {
        const matched = fullText.match(ligandRegex);
        if (matched) {
          const trimmedString = matched[0]
            .replace(/^.*(and|of|with|by|on|the|from|the|as|two)\b/i, "")
            .replace(
              /^.*?(using|following|(metallo)?ligands?|used|selected|namely|linkers?|choose|chose|complex(es)?|formula|polymer)/g,
              ""
            )
            .replace(/\(\s*(H\s*\d*)?\s*L\s*\d*?\s*\)$/g, "")
            .replace(/^(,|\s|·)+/, "")
            .replace(/\s+$/, "");

          const regularizedString = this.regularizeString(trimmedString);

          if (regularizedString.replace(/\s/g, "").match(/^\((H\d*)?L\d*?\)$/))
            // Skip useless string
            return;
          if (regularizedString === "") return;

          matchResult[ligandIdx].push(regularizedString);
        }
      });
    }

    return matchResult;
  }
};
