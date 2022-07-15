const pdfjs = require("pdfjs-dist/legacy/build/pdf");

module.exports = class LigandParser {
  constructor() {}
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
      const textContent = await pageContent.getTextContent();

      const fullText = textContent.items.map((item) => item.str).join("");

      ligandRegexes.forEach((ligandRegex, ligandIdx) => {
        const matched = fullText.match(ligandRegex);
        if (matched) {
          const trimmedString = matched[0]
            .replace(
              /^.*(using|and|of|with|by|on|the|from|(metallo)?ligands?|used|selected|namely|the|choose|chose|complex(es)?)\b/i,
              ""
            )
            .replace(/^,/, "")
            .replace(/^\s+/, "");

          if (trimmedString.replace(/\s/g, "").match(/^\((H\d*)?L\d*?\)$/))
            // Skip useless string
            return;

          matchResult[ligandIdx].push(trimmedString);
        }
      });
    }

    return matchResult;
  }
};
