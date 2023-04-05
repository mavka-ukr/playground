import { INITIAL, parseRawGrammar, Registry } from "vscode-textmate";
import { generateTokensCSSForColorMap } from "monaco-editor/esm/vs/editor/common/languages/supports/tokenization.js";
import { TokenizationRegistry } from "monaco-editor/esm/vs/editor/common/tokenizationRegistry.js";
import { Color } from "monaco-editor/esm/vs/base/common/color.js";

export class SimpleLanguageInfoProvider {
  constructor(config) {
    const { grammars, fetchGrammar, theme, onigLib, monaco } = config;
    this.monaco = monaco;
    this.config = config;

    this.registry = new Registry({
      onigLib,

      async loadGrammar(scopeName) {
        const scopeNameInfo = grammars[scopeName];
        if (scopeNameInfo == null) {
          return null;
        }

        const { type, grammar } = await fetchGrammar(scopeName);

        return parseRawGrammar(grammar, `example.${type}`);
      },

      getInjections(scopeName) {
        const grammar = grammars[scopeName];
        return grammar ? grammar.injections : undefined;
      },

      theme
    });

    this.tokensProviderCache = new TokensProviderCache(this.registry);
  }

  injectCSS() {
    const cssColors = this.registry.getColorMap();
    const colorMap = cssColors.map(Color.Format.CSS.parseHex);
    (new TokenizationRegistry()).setColorMap(colorMap);
    const css = generateTokensCSSForColorMap(colorMap);
    const style = createStyleElementForColorsCSS();
    style.innerHTML = css;
  }

  async fetchLanguageInfo(language) {
    const [tokensProvider, configuration] = await Promise.all([
      this.getTokensProviderForLanguage(language),
      this.config.fetchConfiguration(language)
    ]);
    return { tokensProvider, configuration };
  }

  getTokensProviderForLanguage(
    language
  ) {
    const scopeName = this.getScopeNameForLanguage(language);
    if (scopeName == null) {
      return Promise.resolve(null);
    }

    const encodedLanguageId = this.monaco.languages.getEncodedLanguageId(language);

    return this.tokensProviderCache.createEncodedTokensProvider(scopeName, encodedLanguageId);
  }

  getScopeNameForLanguage(language) {
    for (const [scopeName, grammar] of Object.entries(this.config.grammars)) {
      if (grammar.language === language) {
        return scopeName;
      }
    }
    return null;
  }
}

class TokensProviderCache {
  constructor(registry) {
    this.registry = registry;

    this.scopeNameToGrammar = new Map();
  }

  async createEncodedTokensProvider(
    scopeName,
    encodedLanguageId
  ) {
    const grammar = await this.getGrammar(scopeName, encodedLanguageId);

    return {
      getInitialState() {
        return INITIAL;
      },

      tokenizeEncoded(
        line,
        state
      ) {
        const tokenizeLineResult2 = grammar.tokenizeLine2(line, state);
        const { tokens, ruleStack: endState } = tokenizeLineResult2;
        return { tokens, endState };
      }
    };
  }

  getGrammar(scopeName, encodedLanguageId) {
    const grammar = this.scopeNameToGrammar.get(scopeName);
    if (grammar != null) {
      return grammar;
    }

    const grammarConfiguration = {};

    const promise = this.registry
      .loadGrammarWithConfiguration(scopeName, encodedLanguageId, grammarConfiguration)
      .then((grammar) => {
        if (grammar) {
          return grammar;
        } else {
          throw Error(`failed to load grammar for ${scopeName}`);
        }
      });
    this.scopeNameToGrammar.set(scopeName, promise);
    return promise;
  }
}

function createStyleElementForColorsCSS() {
  const style = document.createElement("style");

  const monacoColors = document.getElementsByClassName("monaco-colors")[0];
  if (monacoColors) {
    monacoColors.parentElement?.insertBefore(style, monacoColors.nextSibling);
  } else {
    // Though if we cannot find it, just append to <head>.
    let { head } = document;
    if (head == null) {
      head = document.getElementsByTagName("head")[0];
    }
    head?.appendChild(style);
  }
  return style;
}
