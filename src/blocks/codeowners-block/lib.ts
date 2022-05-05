import { useStore } from "./store";
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
    result += `${rule.comment}\n\n`;
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

export async function validateOwner(owner?: string) {
  // Three cases.
  // 1. Username starting with @
  // 2. Org/team starting with @
  // 3. Email address.

  if (!owner) return false;
  const store = useStore.getState();
  if (store.validatedOwners[owner]) {
    // Cache hit.
    console.log("Cache hit for", owner);
    return store.validatedOwners[owner];
  }

  const ghapi = store.blockProps?.onRequestGitHubData;

  if (!ghapi) {
    return true;
  }

  if (owner.startsWith("@")) {
    try {
      await ghapi(`/users/${owner.substring(1)}`);
      return true;
    } catch (e) {
      console.log(`${owner}: not a valid user. Invalidating.`, e);
    }

    try {
      await ghapi(`/orgs/${owner.substring(1)}`);
    } catch (e) {
      console.log(`${owner}: not a valid org. Invalidating.`, e);
      return false;
    }
  } else {
    console.log("validating email", owner);
    try {
      const res = await ghapi(`/search/users?q=${owner}`);
      return res.total_count > 0;
    } catch (e) {
      console.log(`${owner}: not a valid email. Invalidating.`, e);
      return false;
    }
  }

  return true;
}
