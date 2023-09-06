<script setup>
import { onMounted, ref } from "vue";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import monokai from "monaco-themes/themes/Monokai.json";
import github from "monaco-themes/themes/GitHub.json";

const editorRef = ref();

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  }
};

onMounted(() => {
  monaco.languages.register({ id: "mavka" });

  monaco.editor.defineTheme("monokai", monokai);
  monaco.editor.defineTheme("github", github);

  monaco.languages.setMonarchTokensProvider("mavka", {
    keywords: [
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
      "не",
      "інякщо",
    ],

    typeKeywords: [
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
    ],

    tokenizer: {
      root: [
        ["взяти пак", "keyword"],
        ["взяти файл", "keyword"],

        [
          /[a-zA-Zа-яА-ЯіІїЇєЄґҐ][\wa-zA-Zа-яА-ЯіІїЇєЄґҐ$]*/u,
          {
            cases: {
              "@keywords": "keyword",
              "@typeKeywords": "keyword",
              "@default": "identifier"
            }
          }
        ],

        // whitespace
        { include: "@whitespace" },

        // delimiter: after number because of .\d floats
        [/[,.]/, "delimiter"],

        // numbers
        [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F]+/, "number.hex"],
        [/\d+/, "number"],

        // strings
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }]
      ],

      comment: [
        [/[^;\-\-]+/, "comment"],
        [";--", "comment", "@push"],
        ["--;", "comment", "@pop"],
        [/[;\-\-]/, "comment"]
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape.invalid"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }]
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/;--/, "comment", "@comment"],
        [/;;.*$/, "comment"]
      ]
    }
  });

  monaco.editor.create(editorRef.value, {
    value: ["дія привіт()", "  друк(\"привіт!\")", "кінець"].join("\n"),
    language: "mavka",
    theme: "vs"
  });
});
</script>

<template>
  <div ref="editorRef" class="editor" />
</template>

<style>
.editor {
  width: 100vw;
  height: 100vh;
}
</style>
