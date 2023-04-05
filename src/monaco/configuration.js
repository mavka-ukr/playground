const REGEXP_PROPERTIES = [
  "indentationRules.decreaseIndentPattern",
  "indentationRules.increaseIndentPattern",
  "indentationRules.indentNextLinePattern",
  "indentationRules.unIndentedLinePattern",

  "folding.markers.start",
  "folding.markers.end",

  "wordPattern"
];

export function rehydrateRegexps(rawConfiguration) {
  const out = JSON.parse(rawConfiguration);
  for (const property of REGEXP_PROPERTIES) {
    const value = getProp(out, property);
    if (typeof value === "string") {
      setProp(out, property, new RegExp(value));
    }
  }
  return out;
}

function getProp(obj, selector) {
  const components = selector.split(".");
  return components.reduce((acc, cur) => (acc != null ? acc[cur] : null), obj);
}

function setProp(obj, selector, value) {
  const components = selector.split(".");
  const indexToSet = components.length - 1;
  components.reduce((acc, cur, index) => {
    if (acc == null) {
      return acc;
    }

    if (index === indexToSet) {
      acc[cur] = value;
      return null;
    } else {
      return acc[cur];
    }
  }, obj);
}
