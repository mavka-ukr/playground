function prefixRE(words) {
  return new RegExp("^(?:" + words.join("|") + ")", "i");
}

function wordRE(words) {
  return new RegExp("^(?:" + words.join("|") + ")$", "ui");
}

// long list of standard functions from lua manual
var builtins = wordRE(["число", "текст", "логічне", "пусто", "так", "ні"]);
var keywords = wordRE(["дія", "якщо", "ні", "кінець", "структура", "більше", "менше"]);

var indentTokens = wordRE(["дія", "якщо", "перебрати", "поки", "структура", "\\("]);
var dedentTokens = wordRE(["кінець", "\\)"]);
var dedentPartial = prefixRE(["кінець", "\\)"]);

function readBracket(stream) {
  var level = 0;
  while (stream.eat("=")) ++level;
  stream.eat("[");
  return level;
}

function normal(stream, state) {
  var ch = stream.next();
  if (ch == "-" && stream.eat("-")) {
    if (stream.eat("[") && stream.eat("["))
      return (state.cur = bracketed(readBracket(stream), "comment"))(stream, state);
    stream.skipToEnd();
    return "comment";
  }
  if (ch == "\"" || ch == "'") return (state.cur = string(ch))(stream, state);
  if (ch == "[" && /[\[=]/.test(stream.peek()))
    return (state.cur = bracketed(readBracket(stream), "string"))(stream, state);
  if (/\d/.test(ch)) {
    stream.eatWhile(/[\wа-яА-ЯіІїЇєЄґҐ.%]/);
    return "number";
  }
  if (/[\w_а-яА-ЯіІїЇєЄґҐ]/.test(ch)) {
    stream.eatWhile(/[\wа-яА-ЯіІїЇєЄґҐ\\\-_.]/);
    return "variable";
  }
  return null;
}

function bracketed(level, style) {
  return function(stream, state) {
    var curlev = null,
      ch;
    while ((ch = stream.next()) != null) {
      if (curlev == null) {
        if (ch === "]") curlev = 0;
      } else if (ch === "=") ++curlev;
      else if (ch === "]" && curlev === level) {
        state.cur = normal;
        break;
      } else curlev = null;
    }
    return style;
  };
}

function string(quote) {
  return function(stream, state) {
    var escaped = false,
      ch;
    while ((ch = stream.next()) != null) {
      if (ch === quote && !escaped) break;
      escaped = !escaped && ch === "\\";
    }
    if (!escaped) state.cur = normal;
    return "string";
  };
}

export const mavkaLang = {
  name: "mavka",

  startState: function() {
    return { basecol: 0, indentDepth: 0, cur: normal };
  },

  token: function(stream, state) {
    if (stream.eatSpace()) return null;
    var style = state.cur(stream, state);
    var word = stream.current();
    if (style === "variable") {
      if (keywords.test(word)) style = "keyword";
      else if (builtins.test(word)) style = "builtin";
    }
    if (style !== "comment" && style !== "string") {
      if (indentTokens.test(word)) ++state.indentDepth;
      else if (dedentTokens.test(word)) --state.indentDepth;
    }
    return style;
  },

  indent: function(state, textAfter, cx) {
    var closing = dedentPartial.test(textAfter);
    return state.basecol + cx.unit * (state.indentDepth - (closing ? 1 : 0));
  },

  languageData: {
    indentOnInput: /^\s*(?:end|until|else|\)|\})$/,
    commentTokens: { line: "--", block: { open: "--[[", close: "]]--" } }
  }
};
