<script setup>
import { currentProjectId, useProjects } from "@/store/projects.js";
import { computed, nextTick, onMounted, ref, toRefs } from "vue";
import { Codemirror } from "vue-codemirror";
import { basicSetup, EditorView } from "codemirror";
import Mavka from "mavka";

import { StreamLanguage } from "@codemirror/language";
import { mavkaLang } from "@/views/mavkalang.js";
import NewFileDialog from "@/components/dialogs/NewFileDialog.vue";
import MemoryLoader from "@/mavka/memoryLoader.js";
import LoadingDialog from "@/components/dialogs/LoadingDialog.vue";

const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

let darkTheme = EditorView.theme({
  "&": {
    color: "white",
    backgroundColor: "var(--bg-color)"
  },
  ".cm-content": {
    caretColor: "var(--text-color)"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--text-color)"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--card-color)"
  },
  ".cm-gutters": {
    backgroundColor: "var(--card-color)",
    color: "var(--text-color)",
    border: "none"
  }
}, { dark: true });

const language = StreamLanguage.define(mavkaLang);

const extensions = [basicSetup, language];
if (isDarkMode) {
  extensions.push(darkTheme);
}

const props = defineProps({
  project: Object
});
const { project } = toRefs(props);

const currentFile = ref(null);

const newFileDialogOpen = ref(false);

const { updateProject } = useProjects();

const code = computed({
  get() {
    return currentFile.value.content;
  },
  set(value) {
    currentFile.value.content = value;
  }
});

const history = ref([]);

function log(...value) {
  history.value = [...history.value, value.join(" ")];
}

const loading = ref("");

async function run() {
  history.value = [];

  function buildGlobalContext(mavka) {
    return new mavka.Context(mavka, null, {
      "друк": mavka.makeProxyFunction((args, context) => log(
        ...args
          .map((arg) => arg.asText().asJsValue(context))
      ))
    });
  }

  function buildLoader(mavka) {
    const files = {};
    for (const pFile of project.value.files) {
      files[pFile.name.substring(0, pFile.name.length - 2)] = pFile.content;
    }
    return new MemoryLoader(mavka, files);
  }

  function buildExternal(mavka) {
    return {};
  }

  const mavka = new Mavka({
    buildGlobalContext,
    buildLoader,
    buildExternal,
    global: window
  });

  mavka.events.on("module::load::remote::start", ({ url }) => {
    loading.value = `[0%] ${url}`;
  });
  mavka.events.on("module::load::remote::progress", ({ url, progress }) => {
    loading.value = `[${progress}%] ${url}`;
  });
  mavka.events.on("module::load::remote::stop", () => {
    loading.value = ``;
  });
  mavka.events.on("module::load::remote::failed", () => {
    loading.value = ``;
  });

  try {
    const mainContext = new mavka.Context(mavka, mavka.context);
    mainContext.setAsync(true);

    await mavka.eval(code.value, mainContext);
  } catch (e) {
    if (e instanceof Error) {
      log(e.message);
    } else if (typeof e === "string") {
      log(e);
    } else if (e instanceof mavka.ThrowValue) {
      log(String(e.value.asJsValue(mavka.context)));
    } else {
      log(String(e));
    }
  }
}

function clearHistory() {
  history.value = [];
}

function close() {
  currentProjectId.value = null;
}

function openNewFileDialog() {
  newFileDialogOpen.value = true;
}

function closeNewFileDialog() {
  newFileDialogOpen.value = false;
}

function createNewFile(file) {
  if (file.name.endsWith(".м")) {
    file.name = file.name.substring(0, file.name.length - 2);
  }
  project.value.files = [
    ...project.value.files,
    {
      name: file.name + ".м",
      content: ""
    }
  ];

  closeNewFileDialog();
}

function deleteFile(file) {
  if (window.confirm("Дійсно видалити цей модуль?")) {
    project.value.files = project.value.files.filter((f) => f.name !== file.name);
  }

  if (file.name === currentFile.value.name) {
    currentFile.value = project.value.files[0];
  }
}

onMounted(() => {
  updateProject({
    ...project.value,
    date: new Date().toISOString()
  });

  nextTick(() => {
    currentFile.value = project.value.files[0];
  });
});
</script>

<template>
  <template v-if="loading">
    <LoadingDialog>
      <div style="text-align: center; padding-bottom: 1rem">
        {{ loading }}
      </div>
    </LoadingDialog>
  </template>
  <template v-if="newFileDialogOpen">
    <NewFileDialog @close="closeNewFileDialog" @save="createNewFile" />
  </template>
  <div class="ui-project-page-wrapper" v-if="currentFile">
    <div class="ui-project-page">
      <div class="ui-project-page-header">
        <div @click="close" class="ui-project-page-header-back">
          <span class="material-icons">arrow_back</span>
        </div>
        <div class="ui-project-page-header-title">
          {{ project.name }}
        </div>
        <div @click="run" class="ui-project-page-header-button play">
          <span class="material-icons">play_arrow</span>
          Запустити
        </div>
      </div>
      <div class="ui-project-page-tabs">
        <template v-for="file in project.files" :key="file.name">
          <div @click="currentFile = file" class="ui-project-page-tab"
               :class="{ active: file.name === currentFile.name }">
            {{ file.name }}
            <div @click.stop.prevent="deleteFile(file)" class="ui-project-page-tab-delete">
              <span class="material-icons">delete</span>
            </div>
          </div>
        </template>
        <div @click="openNewFileDialog" class="ui-project-page-tab new">
          <span class="material-icons">add</span>
        </div>
      </div>
      <div class="ui-project-code">
        <codemirror
          v-model="code"
          :style="{ height: 'calc(100vh - 50px - 50px)' }"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="extensions"
        />
      </div>
    </div>
    <div class="ui-project-console">
      <template v-for="(line, i) in history" :key="i">
        <div class="ui-project-console-item">{{ line }}</div>
      </template>

      <template v-if="history.length">
        <div @click="clearHistory" class="ui-project-console-clear">
          <span class="material-icons">clear_all</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.ui-project-page {
  //
}

.ui-project-page-header {
  height: 50px;
  border-bottom: 1px solid var(--border-color);

  display: flex;
  align-items: center;

  background: var(--card-color);
}

.cm-line {
  font-family: "Fira Code", monospace;
}

.ui-project-page-tabs {
  height: 50px;
  padding-left: 1rem;

  border-bottom: 1px solid var(--border-color);

  display: flex;
  align-items: center;

  background: var(--card-color);

  overflow-x: auto;
}

.ui-project-code {
  .ͼb {
    font-weight: 500;
  }
}

.ui-project-page-tab {
  position: relative;

  padding: 0.5rem 1rem;

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;

  color: var(--text-color);

  cursor: pointer;

  .material-icons {
    font-size: 1rem;
  }

  .ui-project-page-tab-delete {
    position: absolute;
    right: 0.5rem;

    display: none;

    width: 1.5rem;
    height: 1.5rem;

    align-items: center;
    justify-content: center;

    border-radius: 50%;

    cursor: pointer;

    .material-icons {
      color: inherit;
      font-size: 0.8rem;
    }

    &:hover {
      background: rgba(red, 0.25);
      color: red;
    }
  }

  &:hover {
    background: var(--bg-color);
    color: var(--text-color);

    &:not(.new) {
      padding-right: 2rem;
    }

    .ui-project-page-tab-delete {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &.active {
    background: #375BB6;
    color: white;
    font-weight: 500;

    cursor: default;
  }
}

.ui-project-page-tab + .ui-project-page-tab {
  margin-left: 0.25rem;
}

.ui-project-page-header-back {
  width: 50px;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1rem;

  cursor: pointer;

  &:hover {
    background: var(--bg-color);
    color: var(--text-color);
  }
}

.ui-project-page-header-button {
  margin-left: auto;

  padding: 0 1rem;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1rem;

  cursor: pointer;

  .material-icons {
    margin-right: 0.25rem;
  }

  &.play {
    color: green;
  }

  &.stop {
    color: red;
  }

  &:hover {
    background: var(--bg-color);
  }
}

.ui-project-page-header-title {
  margin-left: 0.5rem;
  font-weight: 500;
  font-size: 1.2rem;
}

.ui-project-page-wrapper {
  display: grid;
  grid-template-columns: 3fr 1fr;
}

.ui-project-console {
  position: relative;

  border-left: 1px solid var(--border-color);
  background: var(--card-color);

  overflow: auto;

  &.empty {
    display: flex;
    align-items: center;
    justify-content: center;

    color: var(--hint-color);
  }
}

.ui-project-console-item {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.ui-project-console-clear {
  position: absolute;
  right: 0;
  bottom: 0;

  width: 2rem;
  height: 2rem;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--bg-color);
    color: var(--text-color);
  }

  .material-icons {
    font-size: 1rem;
  }
}
</style>
