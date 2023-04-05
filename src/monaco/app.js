import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { createOnigScanner, createOnigString, loadWASM } from "vscode-oniguruma";
import { SimpleLanguageInfoProvider } from "./providers";
import { registerLanguages } from "./register";
import { rehydrateRegexps } from "./configuration";

export async function main(language) {
  const languages = [
    {
      id: "python",
      extensions: [
        ".py",
        ".rpy",
        ".pyw",
        ".cpy",
        ".gyp",
        ".gypi",
        ".pyi",
        ".ipy",
        ".bzl",
        ".cconf",
        ".cinc",
        ".mcconf",
        ".sky",
        ".td",
        ".tw"
      ],
      aliases: ["Python", "py"],
      filenames: ["Snakefile", "BUILD", "BUCK", "TARGETS"],
      firstLine: "^#!\\s*/?.*\\bpython[0-9.-]*\\b"
    }
  ];
  const grammars = {
    "source.python": {
      language: "python",
      path: "MagicPython.tmLanguage.json"
    }
  };

  const fetchGrammar = async (scopeName) => {
    const { path } = grammars[scopeName];
    const uri = `/grammars/${path}`;
    const response = await fetch(uri);
    const grammar = await response.text();
    const type = path.endsWith(".json") ? "json" : "plist";
    return { type, grammar };
  };

  const fetchConfiguration = async (
    language
  ) => {
    const raw = await import(`./configurations/${language}.json?raw`);
    return rehydrateRegexps(raw.default);
  };

  const data = await loadVSCodeOnigurumWASM();
  loadWASM(data);
  const onigLib = Promise.resolve({
    createOnigScanner,
    createOnigString
  });

  const provider = new SimpleLanguageInfoProvider({
    grammars,
    fetchGrammar,
    configurations: languages.map((language) => language.id),
    fetchConfiguration,
    onigLib,
    monaco
  });

  registerLanguages(
    languages,
    (language) => provider.fetchLanguageInfo(language),
    monaco
  );

  const value = getSampleCodeForLanguage(language);
  const id = "container";
  const element = document.getElementById(id);
  if (element == null) {
    throw Error(`could not find element #${id}`);
  }

  monaco.editor.create(element, {
    value,
    language,
    minimap: {
      enabled: true
    }
  });
  provider.injectCSS();
}

async function loadVSCodeOnigurumWASM() {
  const response = await fetch("/node_modules/vscode-oniguruma/release/onig.wasm");
  const contentType = response.headers.get("content-type");
  if (contentType === "application/wasm") {
    return response;
  }

  return await response.arrayBuffer();
}

function getSampleCodeForLanguage(language) {
  if (language === "python") {
    return `\
import foo

async def bar(): string:
  f = await foo()
  f_string = f"Hooray {f}! format strings are not supported in current Monarch grammar"
  return foo_string
`;
  }

  throw Error(`unsupported language: ${language}`);
}
