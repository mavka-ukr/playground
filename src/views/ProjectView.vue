<script setup lang="ts">
import UiEditor from "@/components/editor/UiEditor.vue";
import UiBackIcon from "@/components/icons/UiBackIcon.vue";
import UiDeleteIcon from "@/components/icons/UiDeleteIcon.vue";
import UiDownloadIcon from "@/components/icons/UiDownloadIcon.vue";
import UiEditIcon from "@/components/icons/UiEditIcon.vue";
import UiMavkaIcon from "@/components/icons/UiMavkaIcon.vue";
import UiPlayIcon from "@/components/icons/UiPlayIcon.vue";
import UiSettingsIcon from "@/components/icons/UiSettingsIcon.vue";
import UiStopIcon from "@/components/icons/UiStopIcon.vue";
import { getPlayground } from "@/playground/getPlayground";
import makeMavka from "@/playground/makeMavka";
import Project from "@/playground/Project";
import type ProjectFile from "@/playground/ProjectFile";
import { onBeforeMount, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const P = getPlayground();

const route = useRoute();
const router = useRouter();

const terminalEl = ref<HTMLDivElement>();

const project = shallowRef(new Project(P, route.params.id as string));
const activeFile = shallowRef<ProjectFile>();
const mavka = ref<any>();
const mavkaVersion = ref<string>(
  project.value.mavkaVersion || P.mavkaVersions[0]?.mavka || "1.0.0",
);

const isWarning = ref(localStorage.getItem("showWarning") !== "false");
const neverAgainWarning = ref(false);
const isLoadingRun = ref(false);
const isRunning = ref(false);
const consoleAfter = ref<string>();

const activeTab = ref<"editor" | "console">("editor");
const isSettingsOpen = ref(false);

watch(
  () => project.value.name,
  (newName) => {
    document.title = newName;
  },
  { immediate: true },
);

watch(project, () => {
  mavkaVersion.value = project.value.mavkaVersion || P.mavkaVersions[0]?.mavka || "1.0.0";
});

watch(mavkaVersion, (newVersion) => {
  project.value.mavkaVersion = newVersion;
});

onBeforeMount(() => {
  if (!P.projects.some((p) => p.id === project.value.id)) {
    router.replace("/");
    return;
  }

  project.value = P.projects.find((p) => p.id === project.value.id)!;

  activeFile.value = project.value.files[0];
});

function onBackClick() {
  router.push("/");
}

function onEditNameClick() {
  const newName = prompt("Введіть нову назву проєкту", project.value.name)?.trim();

  if (newName) {
    project.value.rename(newName);
  }
}

async function onRunClick() {
  if (window.innerWidth <= 768) {
    activeTab.value = "console";
  }

  if (!terminalEl.value) {
    return;
  }

  const version = P.mavkaVersions.find((v) => v.mavka === mavkaVersion.value);

  if (!version) {
    alert(`Не знайдено версію Мавки ${mavkaVersion.value}`);
    return;
  }

  let file = project.value.mainFile;

  if (!file) {
    file = project.value.files[0];
  }

  if (!file) {
    alert("Не вибрано файл для запуску");
    return;
  }

  const mavkaError = Mavka.getSupportError();

  if (mavkaError) {
    alert(mavkaError);
    return;
  }

  isWarning.value = false;
  isRunning.value = true;
  isLoadingRun.value = true;
  consoleAfter.value = "";

  if (mavka.value) {
    try {
      mavka.value.terminate();
      mavka.value = null;
    } catch {}
  }

  try {
    terminalEl.value.innerHTML = "";

    mavka.value = makeMavka(version.pkg, terminalEl.value);

    await mavka.value.load();

    for (const file of project.value.files) {
      mavka.value.write(file.path, file.content);
    }

    isLoadingRun.value = false;

    const resultCode = await mavka.value.run([file.path]);

    consoleAfter.value = `Завершено з кодом ${resultCode}`;
  } catch (error) {
    consoleAfter.value = `Сталася помилка: ${error}`;
  } finally {
    isRunning.value = false;
    isLoadingRun.value = false;
  }
}

function onStopClick() {
  if (mavka.value) {
    mavka.value.terminate();
  }

  isRunning.value = false;

  consoleAfter.value = "Виконання зупинено";
}

function onNewFileClick() {
  let name = prompt("Введіть назву модуля")?.trim();

  if (name) {
    if (!name.endsWith(".м")) {
      name = `${name}.м`;
    }

    const file = project.value.createFile(name);

    activeFile.value = file;
  }
}

function onEditFileClick(file: ProjectFile) {
  let newName = prompt("Введіть нову назву файла", file.name)?.trim();

  if (newName) {
    if (!newName.endsWith(".м")) {
      newName = `${newName}.м`;
    }

    const newFile = project.value.renameFile(file.name, newName);

    if (activeFile.value === file) {
      activeFile.value = newFile;
    }
  }
}

function onDeleteFileClick(file: ProjectFile) {
  const confirmed = confirm(`Ви впевнені, що хочете видалити файл "${file.name}"?`);

  if (confirmed) {
    project.value.deleteFile(file.name);

    if (activeFile.value === file) {
      activeFile.value = project.value.files[0];
    }
  }
}

function dismissWarning() {
  isWarning.value = false;

  if (neverAgainWarning.value) {
    localStorage.setItem("showWarning", "false");
  }
}
</script>

<template>
  <div class="UiProject" :class="{ [`view-${activeTab}`]: true }">
    <div class="UiProjectMain">
      <div class="UiProjectHeader">
        <button @click="onBackClick" class="UiProjectHeaderBack">
          <UiBackIcon />
        </button>

        <div class="UiProjectHeaderName">
          {{ project.name }}

          <span class="UiProjectHeaderNameBadge">локально</span>
        </div>

        <button @click="onEditNameClick" title="Редагувати назву" class="UiProjectHeaderNameButton">
          <UiEditIcon />
        </button>

        <button
          v-if="false"
          @click="onEditNameClick"
          title="Завантажити як ZIP"
          class="UiProjectHeaderNameButton"
        >
          <UiDownloadIcon />
        </button>

        <div class="UiProjectHeaderSelectors">
          <select v-model="mavkaVersion" class="UiProjectHeaderVersion">
            <option v-for="version in P.mavkaVersions" :key="version.mavka" :value="version.mavka">
              Мавка {{ version.mavka }}
            </option>
          </select>

          <select
            v-if="project.files.length"
            v-model="project.mainFile"
            class="UiProjectHeaderMainFile"
          >
            <option v-for="file in project.files" :key="file.path" :value="file">
              {{ file.name }}
            </option>
          </select>
        </div>

        <button
          @click="isSettingsOpen = true"
          class="UiProjectHeaderSettingsToggle"
          title="Налаштування проєкту"
        >
          <UiSettingsIcon />
        </button>

        <button v-if="!isRunning" @click="onRunClick" class="UiProjectHeaderRun">
          <UiPlayIcon />
          <span>Запустити</span>
        </button>
        <button v-else @click="onStopClick" class="UiProjectHeaderRun stop">
          <UiStopIcon />
          <span>Зупинити</span>
        </button>
      </div>

      <div class="UiProjectTabs">
        <div class="UiProjectTabsScroll">
          <button
            v-for="file in project.files"
            @click="activeFile = file"
            :key="file.path"
            class="UiProjectTab"
            :class="{ active: activeFile === file }"
          >
            {{ file.name }}

            <div class="UiProjectTabActionsPlaceholder"></div>

            <div class="UiProjectTabActions">
              <button @click.prevent.stop="onEditFileClick(file)" class="UiProjectTabAction">
                <UiEditIcon />
              </button>

              <button @click.prevent.stop="onDeleteFileClick(file)" class="UiProjectTabAction red">
                <UiDeleteIcon />
              </button>
            </div>
          </button>

          <button @click="onNewFileClick" class="UiProjectTab new">+</button>
        </div>
      </div>

      <div v-if="activeFile" class="UiProjectEditor">
        <KeepAlive>
          <UiEditor :key="activeFile.path" v-model="activeFile.content" />
        </KeepAlive>
      </div>
    </div>

    <div class="UiProjectConsole">
      <div ref="terminalEl" class="terminal"></div>

      <div v-if="consoleAfter" class="UiProjectConsoleAfter">
        {{ consoleAfter }}
      </div>

      <div v-if="isWarning" class="UiProjectConsoleWarning">
        <div class="UiProjectConsoleWarningText">
          Деякі можливості Бібліотеки Мавки в Майданчику можуть бути обмежені по причині запуску у
          Web browser (через Wasm64). Використовуйте Майданчик для знайомства з мовою.
        </div>
        <div class="UiProjectConsoleWarningButtons">
          <label for="neverAgainWarning">
            <input id="neverAgainWarning" type="checkbox" v-model="neverAgainWarning" />
            Більше не показувати
          </label>

          <button @click="dismissWarning" class="UiProjectConsoleWarningButton">Добре!</button>
        </div>
      </div>

      <div v-if="isLoadingRun" class="UiProjectConsoleLoading">
        <UiMavkaIcon />
      </div>
    </div>

    <div v-if="isSettingsOpen" class="UiProjectModalOverlay" @click.self="isSettingsOpen = false">
      <div class="UiProjectModal">
        <div class="UiProjectModalHeader">
          <h3>Налаштування проєкту</h3>
          <button @click="isSettingsOpen = false" class="UiProjectModalClose">&times;</button>
        </div>
        <div class="UiProjectModalContent">
          <div class="UiProjectModalField">
            <label>Версія Мавки</label>
            <select v-model="mavkaVersion">
              <option
                v-for="version in P.mavkaVersions"
                :key="version.mavka"
                :value="version.mavka"
              >
                Мавка {{ version.mavka }}
              </option>
            </select>
          </div>
          <div v-if="project.files.length" class="UiProjectModalField">
            <label>Головний файл</label>
            <select v-model="project.mainFile">
              <option v-for="file in project.files" :key="file.path" :value="file">
                {{ file.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="UiProjectMobileNav">
      <button
        @click="activeTab = 'editor'"
        class="UiProjectMobileNavButton"
        :class="{ active: activeTab === 'editor' }"
      >
        Редактор
      </button>
      <button
        @click="activeTab = 'console'"
        class="UiProjectMobileNavButton"
        :class="{ active: activeTab === 'console' }"
      >
        Консоль
        <span v-if="isRunning" class="UiProjectMobileNavBadge"></span>
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.UiProject {
  --header-height: 3rem;
  --nav-height: 0px;

  min-height: 100%;
  max-height: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 400px;

  &Main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  &Header {
    width: 100%;
    height: var(--header-height);
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  &HeaderBack {
    width: var(--header-height);
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-right: 1px solid var(--border);
    font-size: 1.25rem;
    color: var(--text);
    cursor: pointer;

    &:hover {
      background-color: var(--hover);
    }

    &:active {
      background-color: var(--press);
    }
  }

  &HeaderName {
    margin-left: 1rem;
    font-size: 1rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &HeaderNameBadge {
    margin-left: 0.5rem;
    padding: 0.125rem 0.25rem;
    font-size: 0.7rem;
    font-weight: 400;
    color: var(--bg);
    background-color: var(--muted);
    border-radius: 0.25rem;
  }

  &HeaderNameButton {
    margin-left: 0.25rem;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    color: var(--text);
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      background-color: var(--hover);
    }

    &:active {
      background-color: var(--press);
    }
  }

  &HeaderSelectors {
    margin-left: auto;
    display: flex;
    align-items: center;
    height: 100%;
  }

  &HeaderSettingsToggle {
    display: none;
  }

  &HeaderVersion {
    height: var(--header-height);
    padding: 0 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-left: 1px solid var(--border);
    font-size: 1rem;
    color: var(--text);
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      background-color: var(--hover);
    }

    &:active {
      background-color: var(--press);
    }
  }

  &HeaderMainFile {
    max-width: 8rem;
    height: var(--header-height);
    padding: 0 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-left: 1px solid var(--border);
    font-size: 1rem;
    color: var(--text);
    cursor: pointer;
    flex-shrink: 0;
    text-overflow: ellipsis;

    &:hover {
      background-color: var(--hover);
    }

    &:active {
      background-color: var(--press);
    }
  }

  &HeaderRun {
    --color: var(--green);

    height: var(--header-height);
    padding: 0 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-left: 1px solid var(--border);
    font-size: 1rem;
    color: var(--color);
    cursor: pointer;
    flex-shrink: 0;

    svg {
      margin-right: 0.25rem;
      font-size: 1.25rem;
    }

    &.stop {
      --color: var(--red);
    }

    &:hover {
      background-color: var(--hover);
    }

    &:active {
      background-color: var(--press);
    }
  }

  &Tabs {
    width: 100%;
    height: var(--header-height);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    overflow: hidden;
  }

  &TabsScroll {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 0.5rem;
    overflow-x: auto;
    white-space: nowrap;
  }

  &Tab {
    position: relative;
    height: calc(var(--header-height) - 1rem);
    padding: 0 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-radius: 1rem;
    font-size: 0.9rem;
    color: var(--text);
    cursor: pointer;
    flex-shrink: 0;
    white-space: nowrap;

    &ActionsPlaceholder {
      width: 0;
    }

    &Actions {
      position: absolute;
      top: 50%;
      right: 0.25rem;
      transform: translateY(-50%);
      display: none;
      align-items: center;
    }

    &Action {
      --color: var(--text);

      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: none;
      border-radius: 50%;
      color: var(--text);
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);

        &.red {
          color: red;
        }
      }
    }

    &:hover {
      background-color: var(--hover);
    }

    &:active {
      background-color: var(--press);
    }

    &.new {
      width: calc(var(--header-height) - 1rem);
      padding: 0;
      border-radius: 50%;
      font-size: 1.25rem;
    }

    &.active {
      background-color: var(--blue);
      color: white;

      .UiProjectTabActionsPlaceholder {
        width: 3rem;
      }

      .UiProjectTabActions {
        display: flex;
      }

      .UiProjectTabAction {
        color: white;

        &:hover {
          &.red {
            color: red;
          }
        }
      }
    }
  }

  &Tab + &Tab {
    margin-left: 0.25rem;
  }

  &Editor {
    width: 100%;
    flex-grow: 1;
    min-height: 0;
  }

  &Console {
    overflow: auto;
    position: relative;
    width: 400px;
    min-height: 100%;
    max-height: 100%;
    height: 100%;
    padding: 10px;
    border-left: 1px solid var(--border);
    cursor: text;
    font-family: "Fira Code", monospace;

    &After {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: var(--muted);
    }

    &Warning {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: var(--bg);
      cursor: default;

      svg {
        font-size: 3rem;
        animation: spin 500ms ease-in-out infinite;

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }
      }

      &Text {
        background-color: yellow;
        color: black;
      }

      &Buttons {
        margin-top: 1rem;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        label {
          font-size: 0.8rem;
        }
      }

      &Button {
        margin-top: 1rem;

        background-color: var(--text);
        border: none;
        color: var(--bg);
        cursor: pointer;
      }
    }

    &Loading {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg);
      cursor: wait;

      svg {
        font-size: 3rem;
        animation: spin 750ms ease-in-out infinite;

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }
      }
    }

    .terminal-row {
      display: flex;
      align-items: center;
      width: 100%;
      white-space: pre-wrap;
      font-family: "Fira Code", monospace;

      span {
        font-family: inherit;
        white-space: pre-wrap;
      }

      input {
        flex: 1;
        font-size: 1rem;
        background: transparent;
        color: inherit;
        border: none;
        outline: none;
        padding: 0;
        font-family: inherit;
      }
    }

    .term-color-red {
      color: var(--red);
    }

    .term-color-green {
      color: var(--green);
    }

    .term-color-blue {
      color: var(--blue);
    }

    .term-color-yellow {
      color: var(--yellow);
    }

    .term-color-default {
      color: inherit;
    }
  }

  &ModalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 100;
  }

  &Modal {
    width: 100%;
    background-color: var(--bg);
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
    animation: slideUp 200ms ease-out;

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }

      to {
        transform: translateY(0);
      }
    }

    &Header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;

      h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text);
      }
    }

    &Close {
      background: transparent;
      border: none;
      font-size: 1.75rem;
      color: var(--muted);
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }

    &Field {
      display: flex;
      flex-direction: column;
      margin-bottom: 1.25rem;

      label {
        font-size: 0.85rem;
        color: var(--muted);
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      select {
        height: 3rem;
        padding: 0 1rem;
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        background-color: transparent;
        color: var(--text);
        font-size: 1rem;
        outline: none;
        width: 100%;
      }
    }
  }

  &MobileNav {
    display: none;
  }
}

@media (max-width: 1140px) {
  .UiProject {
    &Header {
      padding-right: 0.25rem;
    }

    &HeaderName {
      max-width: 100%;
    }

    &HeaderSelectors {
      display: none;
    }

    &HeaderSettingsToggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--header-height);
      height: var(--header-height);
      background-color: transparent;
      border: none;
      border-left: 1px solid var(--border);
      color: var(--text);
      cursor: pointer;
      margin-left: auto;
      font-size: 1rem;

      &:active {
        background-color: var(--press);
      }
    }

    &HeaderRun {
      border-left: 1px solid var(--border);
    }

    &HeaderRun span {
      display: none;
    }
  }
}

@media (max-width: 1023px) {
  .UiProject {
    --nav-height: 3.5rem;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr var(--nav-height);

    &Main,
    &Console {
      grid-row: 1;
      grid-column: 1;
      width: 100%;
      max-height: calc(100vh - var(--nav-height));
      height: calc(100vh - var(--nav-height));
    }

    &Console {
      border-left: none;
    }

    &.view-editor {
      .UiProjectMain {
        display: flex;
      }

      .UiProjectConsole {
        display: none;
      }
    }

    &.view-console {
      .UiProjectMain {
        display: none;
      }

      .UiProjectConsole {
        display: block;
      }
    }

    &MobileNav {
      grid-row: 2;
      grid-column: 1;
      display: flex;
      border-top: 1px solid var(--border);
      background-color: var(--bg);
      z-index: 10;

      &Button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        border: none;
        font-size: 1rem;
        font-weight: 500;
        color: var(--muted);
        cursor: pointer;
        position: relative;

        &.active {
          color: var(--blue);

          &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background-color: var(--blue);
          }
        }
      }

      &Badge {
        position: absolute;
        top: 1rem;
        right: 2rem;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--green);
      }
    }
  }
}
</style>
