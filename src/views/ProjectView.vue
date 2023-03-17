<script setup>
import { currentProjectId, useProjects } from "@/store/projects.js";
import { computed, nextTick, onMounted, ref, toRefs } from "vue";
import { Codemirror } from "vue-codemirror";
import { basicSetup } from "codemirror";
import Mavka from "mavka";

import { StreamLanguage } from "@codemirror/language";
import { mavkaLang } from "@/views/mavkalang.js";

const language = StreamLanguage.define(mavkaLang);

const props = defineProps({
  project: Object
});
const { project } = toRefs(props);

const currentFile = ref(null);

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
  history.value = [...history.value, value.join(' ')];
}

let extId = 0;

function buildGlobalContext(mavka) {
  return new mavka.Context(mavka, null, {
    "друк": new mavka.JsFunctionCell(mavka, (args) => log(
      ...args
        .map((arg) => mavka.toCell(arg).asString().asJsString())
    )),
    "global": mavka.toCell(window)
  });
}

function buildLoader(mavka) {
  return null;
}

function buildExternal(mavka) {
  return {};
}

const mavka = new Mavka({
  buildGlobalContext,
  buildLoader,
  buildExternal
});

async function run() {
  history.value = [];

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
      log(e.value);
    } else {
      log(String(e));
    }
  }
}

function close() {
  currentProjectId.value = null;
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
  <div class="ui-project-page" v-if="currentFile">
    <div class="ui-project-page-header">
      <div @click="close" class="ui-project-page-header-back">
        <span class="material-icons">arrow_back</span>
      </div>
      <div class="ui-project-page-header-title">
        {{ project.name }}
      </div>
      <div @click="run" class="ui-project-page-header-button play">
        <span class="material-icons">play_arrow</span>
      </div>
    </div>
    <div class="ui-project-page-tabs">
      <div class="ui-project-page-tab active">старт.м</div>
      <div class="ui-project-page-tab new">
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
        :extensions="[basicSetup, language]"
      />
      <div class="ui-project-console">
        <template v-for="(line, i) in history" :key="i">
          <div class="ui-project-console-item">{{ line }}</div>
        </template>
      </div>
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

.ui-project-page-tab {
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

  &:hover {
    background: var(--bg-color);
    color: var(--text-color);
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
  margin-left: 0.5rem;

  width: 50px;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1rem;

  cursor: pointer;

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

.ui-project-code {
  display: grid;
  grid-template-columns: 3fr 1fr;
}

.ui-project-console {
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
</style>
