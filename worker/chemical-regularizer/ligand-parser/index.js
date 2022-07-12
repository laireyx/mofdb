const pdfjs = require("pdfjs-dist/legacy/build/pdf");

module.exports = class LigandParser {
  constructor() {}
  async parse({ pdf = "", ligands = [] }) {
    const doc = await pdfjs.getDocument({
      url: pdf,
      verbosity: 0,
    }).promise;

    const matchResult = {};
    ligands.forEach((ligand) => (matchResult[ligand] = []));

    const ligandRegexes = ligands.map((ligandStr) => {
      return new RegExp(
        "[^.;]*?" + ["\\(", ...ligandStr.split(""), "\\)"].join("\\s*"),
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
          const trimmedString = matched[0].replace(
            /^.*\b(using|and|of|with|by|on|the|from|ligand|used|selected|namely)\b/,
            ""
          );
          matchResult[ligands[ligandIdx]].push(trimmedString);
        }
      });
    }

    return matchResult;
  }
};
