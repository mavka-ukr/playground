function prefixRE(words) {
  return new RegExp(`^(?:${words.join("|")})`, "u");
}

function wordRE(words) {
  return new RegExp(`^(?:${words.join("|")})$`, "u");
}

const types = wordRE([
  "текст",
  "логічне",
  "число",
  "список",
  "словник",
  "обʼєкт",
  "щось",
  "ніщо",
  "так",
  "ні",
  "пусто"
]);
const keywords = wordRE([
  "дія",
  "структура",
  "перебрати",
  "якщо",
  "чекати",
  "взяти",
  "дати",
  "як",
  "є",
  "вернути",
  "тривала",
  "і",
  "або",
  "спробувати",
  "зловити",
  "інакше",
  "впасти",
  "поки",
  "модуль",
  "рівно",
  "більше",
  "менше",
  "більше",
  "менше",
  "рівно",
  "є",
  "містить",
  "макет",
  "втілює",
  "js",
  "кінець",
  "не"
]);

const indentTokens = wordRE([
  "дія",
  "якщо",
  "перебрати",
  "поки",
  "структура",
  "модуль",
  "спробувати",
  "\\("
]);
const dedentTokens = wordRE([
  "кінець",
  "\\)"
]);
const dedentPartial = prefixRE([
  "кінець",
  "зловити",
  "\\)"
]);

function readBracket(stream) {
  let level = 0;

  while (stream.eat("=")) {
    ++level;
  }

  stream.eat("[");
  return level;
}

function normal(stream, state) {
  const ch = stream.next();

  if (ch === ";" && stream.eat(";")) {
    stream.skipToEnd();
    return "comment";
  }

  if (ch === "\"") {
    return (state.cur = string(ch))(stream, state);
  }

  if (ch === "[" && /[\[=]/.test(stream.peek())) {
    return (state.cur = bracketed(readBracket(stream), "string"))(stream, state);
  }

  if (/\d/.test(ch)) {
    stream.eatWhile(/[\wа-яА-ЯіІїЇєЄґҐ.%ʼ]/u);
    return "number";
  }

  if (/[\w_а-яА-ЯіІїЇєЄґҐʼ]/u.test(ch)) {
    stream.eatWhile(/[\wа-яА-ЯіІїЇєЄґҐ\\\-_ʼ]/u);
    return "variable";
  }

  return null;
}

function bracketed(level, style) {
  return (stream, state) => {
    let curlev = null, ch;

    while ((ch = stream.next()) != null) {
      if (curlev == null) {
        if (ch === "--;") {
          curlev = 0;
        }
      } else if (ch === "=") {
        ++curlev;
      } else if (ch === "--;" && curlev === level) {
        state.cur = normal;
        break;
      } else {
        curlev = null;
      }
    }

    return style;
  };
}

function string(quote) {
  return (stream, state) => {
    let escaped = false, ch;

    while ((ch = stream.next()) != null) {
      if (ch === quote && !escaped) {
        break;
      }

      escaped = !escaped && ch === "\\";
    }

    if (!escaped) {
      state.cur = normal;
    }

    return "string";
  };
}

export const mavkaLang = {
  name: "mavka",

  startState: () => ({ basecol: 0, indentDepth: 0, cur: normal }),

  token: (stream, state) => {
    if (stream.eatSpace()) {
      return null;
    }

    let style = state.cur(stream, state);

    const word = stream.current();

    if (style === "variable") {
      if (keywords.test(word)) {
        style = "keyword";
      } else if (types.test(word)) {
        style = "typeName";
      }
    }

    if (style !== "comment" && style !== "string") {
      if (indentTokens.test(word)) {
        ++state.indentDepth;
      } else if (dedentTokens.test(word)) {
        --state.indentDepth;
      }
    }

    return style;
  },

  indent: (state, textAfter, cx) => {
    const closing = dedentPartial.test(textAfter);
    return state.basecol + cx.unit * (state.indentDepth - (closing ? 1 : 0));
  },

  languageData: {
    indentOnInput: /^\s*(?:кінець|інакше|зловити|\)|\})$/,
    commentTokens: { line: ";;", block: { open: ";--", close: "--;" } }
  }
};
