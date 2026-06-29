<script setup lang="ts">
import { useIsDarkMode } from "@/playground/useIsDarkMode";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Props {
  modelValue: string;
  language?: "mavka" | string;
}

const props = withDefaults(defineProps<Props>(), {
  language: "mavka",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const isDarkMode = useIsDarkMode();
const editorRef = ref<HTMLDivElement | null>(null);
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

const codeValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

self.MonacoEnvironment = {
  getWorker: () => new editorWorker(),
};

const configureMonacoRegistry = () => {
  if (monaco.languages.getLanguages().some((lang) => lang.id === "mavka")) {
    return;
  }

  monaco.languages.register({ id: "mavka" });

  monaco.languages.setMonarchTokensProvider("mavka", {
    keywords: [
      "дія",
      "клас",
      "перебрати",
      "передати",
      "перестрибнути",
      "перервати",
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
      "кінець",
      "не",
      "дійсне",
      "недійсне",
      "я",
      "власна",
      "взаємо",
      "нескінченність",
      "невизначеність",
    ],
    typeKeywords: [],
    tokenizer: {
      root: [
        ["взяти модуль", "keyword"],
        ["взяти пак", "keyword"],
        ["взяти біб", "keyword"],
        [
          /[a-zA-Zа-яА-ЯіІїЇєЄґҐ][\wa-zA-Zа-яА-ЯіІїЇєЄґҐ$]*/u,
          {
            cases: {
              "@keywords": "keyword",
              "@typeKeywords": "keyword",
              "@default": "identifier",
            },
          },
        ],
        { include: "@whitespace" },
        [/[,.]/, "delimiter"],
        [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F]+/, "number.hex"],
        [/\d+/, "number"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
      ],
      comment: [
        [/[^;\*]+/, "comment"],
        [";\\*", "comment", "@push"],
        ["\\*;", "comment", "@pop"],
        [/[;\*]/, "comment"],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape.invalid"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],
      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/;\*/, "comment", "@comment"],
        [/;;.*$/, "comment"],
      ],
    },
  });
};

const resolveTheme = (dark: boolean) => (dark ? "vs-dark" : "github-light");

onMounted(() => {
  configureMonacoRegistry();

  if (!editorRef.value) return;

  editorInstance = monaco.editor.create(editorRef.value, {
    value: codeValue.value,
    language: props.language,
    theme: resolveTheme(isDarkMode.value),
    automaticLayout: true,
    fontFamily: "'Fira Code', monospace",
    fontSize: 14,
    lineHeight: 22,
    minimap: { enabled: false },
    roundedSelection: true,
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
    unicodeHighlight: {
      ambiguousCharacters: false,
      nonBasicASCII: false,
      invisibleCharacters: true,
    },
    renderLineHighlight: "all",
  });

  editorInstance.addAction({
    id: "save-code",
    label: "Save Code",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    run: function (ed) {
      const currentCode = ed.getValue();

      emit("save", currentCode);
    },
  });

  editorInstance.addAction({
    id: "editor.action.duplicateSelection",
    label: "Duplicate Selection",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD],
    run: function (ed) {
      const selection = ed.getSelection();
      if (!selection) return;

      const model = ed.getModel();
      if (!model) return;

      ed.pushUndoStop();

      if (!selection.isEmpty()) {
        const selectedText = model.getValueInRange(selection);
        const insertRange = new monaco.Range(
          selection.endLineNumber,
          selection.endColumn,
          selection.endLineNumber,
          selection.endColumn,
        );

        ed.executeEdits("duplicate-inline", [
          {
            range: insertRange,
            text: selectedText,
            forceMoveMarkers: false,
          },
        ]);

        const lineDiff = selection.endLineNumber - selection.startLineNumber;
        const startLine = selection.endLineNumber;
        const startColumn = selection.endColumn;
        const endLine = startLine + lineDiff;

        let endColumn = selection.endColumn;
        if (selection.startLineNumber === selection.endLineNumber) {
          endColumn = selection.endColumn + selectedText.length;
        }

        ed.setSelection(new monaco.Selection(startLine, startColumn, endLine, endColumn));
      } else {
        const line = selection.startLineNumber;
        const maxCol = model.getLineMaxColumn(line);
        const lineContent = model.getLineContent(line);

        ed.executeEdits("duplicate-line", [
          {
            range: new monaco.Range(line, maxCol, line, maxCol),
            text: "\n" + lineContent,
            forceMoveMarkers: true,
          },
        ]);

        ed.setPosition({
          lineNumber: line + 1,
          column: selection.startColumn,
        });
      }

      ed.pushUndoStop();
    },
  });

  editorInstance.onDidChangeModelContent(() => {
    const currentVal = editorInstance?.getValue() ?? "";
    if (codeValue.value !== currentVal) {
      codeValue.value = currentVal;
    }
  });
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (editorInstance && editorInstance.getValue() !== newVal) {
      editorInstance.setValue(newVal);
    }
  },
);

watch(
  () => props.language,
  (newLang) => {
    if (!editorInstance) return;
    const model = editorInstance.getModel();
    if (model && ["mavka"].includes(newLang)) {
      monaco.editor.setModelLanguage(model, newLang);
    }
  },
);

watch(
  () => isDarkMode.value,
  (dark) => {
    monaco.editor.setTheme(resolveTheme(dark));
  },
);

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
  }
});
</script>

<template>
  <div class="editor-container">
    <div ref="editorRef" class="editor-surface" />
  </div>
</template>

<style lang="scss" scoped>
.editor-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .editor-surface {
    width: 100%;
    height: 100%;
  }

  :deep(.monaco-editor) {
    .line-numbers {
      color: rgba(115, 138, 148, 0.4) !important;
    }
  }
}
</style>
