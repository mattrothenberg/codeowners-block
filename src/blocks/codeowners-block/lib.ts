export interface Rule {
  comment: string;
  pattern: string;
  owners: string[];
}

export interface Item {
  text: string;
  id: string;
}

export function stringifyRules(rules: Rule[]) {
  let result = ``;
  // convert the rules array to a multiline string.
  rules.forEach((rule) => {
    result += rule.comment + "\n";
    result += rule.pattern + "      " + rule.owners.join(" ") + "\n";
  });

  return result;
}

export function parseCodeOwnersFile(content: string) {
  let rules = [];
  let splitByline = content.split("\n");
  let comment = "";
  for (let i = 0; i < splitByline.length; i++) {
    if (splitByline[i].startsWith("#")) {
      comment += splitByline[i] + "\n";
      if (splitByline[i + 1] === "") {
        continue;
      }
      if (!splitByline[i + 1].startsWith("#")) {
        let entry = splitByline[i + 1];
        const [pattern, ...owners] = entry.split(" ");

        rules.push({
          comment: comment.trimEnd(),
          pattern,
          owners: owners.filter(Boolean),
        });
        comment = "";
      }
    }

    if (splitByline[i].length === 0) {
      continue;
    }

    const [pattern, ...owners] = splitByline[i].split(" ");

    rules.push({
      comment: comment.trimEnd(),
      pattern,
      owners: owners.filter(Boolean),
    });
  }
  return rules;
}

export const STUB_RULE = {
  pattern: "",
  owners: [],
  comment: "",
};
