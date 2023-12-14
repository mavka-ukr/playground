<script setup>
import { currentProjectId, useProjects } from "@/store/projects.js";
import { computed, nextTick, onMounted, ref, toRefs } from "vue";
import { Codemirror } from "vue-codemirror";
import { basicSetup, EditorView } from "codemirror";

import { StreamLanguage } from "@codemirror/language";
import { mavkaLang } from "@/views/mavkalang.js";
import NewFileDialog from "@/components/dialogs/NewFileDialog.vue";
import FrameWindow from "@/components/windows/FrameWindow.vue";
import { versionsState } from "../store/projects.js";

const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

let darkTheme = EditorView.theme({
  "&": {
    color: "#abb2bf",
    backgroundColor: "var(--card-color)",
    fontFamily: "Fira Code, monospace",
    fontWeight: 500
  },
  ".cm-content": {
    caretColor: "var(--text-color)"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--text-color)"
  },
  ".cm-gutters": {
    backgroundColor: "var(--card-color)",
    color: "var(--text-color)",
    border: "none"
  },
  ".ͼb": {
    color: "#c678dd"
  },
  ".ͼe": {
    color: "#98c379"
  },
  ".ͼd": {
    color: "#d19a66"
  },
  ".ͼi": {
    color: "#56b6c2"
  },
  ".cm-activeLine": {
    backgroundColor: "#222227"
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

const showWindow = ref(false);
const isRunning = ref(false);
const keepCase = ref(false);
const currentFile = ref(null);
const newFileDialogOpen = ref(false);
const { updateProject } = useProjects();
const fullCode = ref("");
const version = ref("остання");

const code = computed({
  get() {
    return currentFile.value.content;
  },
  set(value) {
    currentFile.value.content = value;
  }
});

const rawHistory = ref("");

const history = computed(() => {
  let strings = rawHistory.value.split("\n");
  if (strings[strings.length - 1] === "") {
    strings = strings.slice(0, -1);
  }
  return strings;
});

function log(value) {
  rawHistory.value += value;
}

const loading = ref("");

async function run() {
  if (isRunning.value) {
    keepCase.value = false;
    isRunning.value = false;
    loading.value = "";
  } else {
    keepCase.value = false;
    rawHistory.value = "";
    isRunning.value = true;
    loading.value = "starting...";

    try {
      fullCode.value = code.value;
    } catch (e) {
      alert(e.message);
      isRunning.value = false;
      loading.value = "";
      return;
    }
  }
}

function onFrameEvent(event) {
  if (event.type === "log") {
    log(event.value.join(" ") + "\n");
  }
  if (event.type === "print") {
    log(event.value.join(""));
  }
  if (event.type === "showcase") {
    keepCase.value = true;
    showWindow.value = true;
  }
  if (event.type === "hidecase") {
    keepCase.value = false;
    showWindow.value = false;
  }
  if (event.type === "keepcase") {
    keepCase.value = true;
  }
  if (event.type === "failed") {
    isRunning.value = false;
    loading.value = "";
    log(event.value + "\n");
  }
  if (event.type === "ended") {
    if (keepCase.value) {
      return;
    }
    isRunning.value = false;
    loading.value = "";
  }
  if (event.type === "loading") {
    loading.value = event.value;
  }
  if (event.type === "start") {
    loading.value = "";
  }
}

function clearHistory() {
  rawHistory.value = "";
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
      name: `${file.name}.м`,
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
  <template v-if="fullCode && isRunning">
    <FrameWindow @close="showWindow = false"
                 @frame-event="onFrameEvent"
                 v-show="showWindow"
                 :code="fullCode"
                 :version="version"
                 :filename="currentFile.name"
                 :files="project.files" />
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
        <select v-model="version" class="ui-project-page-header-button" style="margin-left: auto;">
          <option value="остання">Остання</option>
          <template v-for="v in versionsState.versions">
            <option :value="v">{{ v }}</option>
          </template>
        </select>
        <template v-if="isRunning">
          <div @click="run" class="ui-project-page-header-button stop">
            <span class="material-icons">stop</span>
            Зупинити
          </div>
        </template>
        <template v-else>
          <div @click="run" class="ui-project-page-header-button play">
            <span class="material-icons">play_arrow</span>
            Запустити
          </div>
        </template>
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

      <template v-if="loading && !history.length">
        <div class="ui-project-console-loading">
          <img class="logo-light" src="@/assets/images/logo-light.png" alt="">
          <img class="logo-dark" src="@/assets/images/logo-dark.png" alt="">
        </div>
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


.logo-dark,
.logo-light {
  display: none;
}

.cs-light {
  .logo-dark {
    display: none;
  }

  .logo-light {
    display: inline;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ui-project-console-loading {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 50px;
    height: 50px;

    animation: spin 500ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  &::before {
    position: absolute;
    content: '';
    inset: 0;
    background-color: rgba(white, 0.1);
    backdrop-filter: blur(0.5rem);
  }
}

.cs-dark {
  .logo-light {
    display: none;
  }

  .logo-dark {
    display: inline;
  }
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
  //font-weight: 500;
  //color: #3f3f3f;
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
  padding: 0 1rem;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-color);
  outline: none;

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
