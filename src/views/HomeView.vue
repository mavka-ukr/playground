<script setup>
import { ref } from "vue";
import NewProjectDialog from "@/components/dialogs/NewProjectDialog.vue";
import { currentProjectId, useProjects } from "@/store/projects.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { projects } = useProjects();

const createDialogOpen = ref(false);

function openCreateDialog() {
  createDialogOpen.value = true;
}

function closeCreateDialog() {
  createDialogOpen.value = false;
}

function openProject(project) {
  currentProjectId.value = project.id;
}
</script>

<template>
  <template v-if="createDialogOpen">
    <NewProjectDialog @close="closeCreateDialog" />
  </template>

  <div class="ui-home-page">
    <div class="ui-home-page-logo">
      <img src="@/assets/images/logo.svg" alt="Logo">
    </div>

    <div class="ui-home-page-content">
      <h3 class="ui-home-page-projects-title">
        Останні
      </h3>
      <ul class="ui-home-page-projects">
        <li @click="openCreateDialog" class="ui-home-page-project new">
          <div class="ui-home-page-project-name">
            <span class="material-icons">add</span>
            Створити новий проєкт
          </div>
        </li>
        <template v-for="project in projects" :key="project.id">
          <li @click="openProject(project)" class="ui-home-page-project">
            <div class="ui-home-page-project-name">
              {{ project.name }}
            </div>
            <div class="ui-home-page-project-info">
              {{ dayjs(project.date).fromNow() }}
            </div>
          </li>
        </template>
      </ul>
      <h3 class="ui-home-page-projects-title">
        Приклади
      </h3>
      <ul class="ui-home-page-projects">
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            Привіт від Лесі
          </div>
          <div class="ui-home-page-project-info">
            <div class="ui-home-page-project-badge">
              консольна програма
            </div>
            <div class="ui-home-page-project-badge">
              скоро
            </div>
          </div>
        </li>
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            Сторінка
          </div>
          <div class="ui-home-page-project-info">
            <div class="ui-home-page-project-badge">
              вебсайт
            </div>
            <div class="ui-home-page-project-badge">
              скоро
            </div>
          </div>
        </li>
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            Телеграм-бот
          </div>
          <div class="ui-home-page-project-info">
            <div class="ui-home-page-project-badge">
              консольна програма
            </div>
            <div class="ui-home-page-project-badge">
              скоро
            </div>
          </div>
        </li>
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            Розпізнавання чисел
          </div>
          <div class="ui-home-page-project-info">
            <div class="ui-home-page-project-badge">
              нейромережа
            </div>
            <div class="ui-home-page-project-badge">
              скоро
            </div>
          </div>
        </li>
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            ChatGPT
          </div>
          <div class="ui-home-page-project-info">
            <div class="ui-home-page-project-badge">
              нейромережа
            </div>
            <div class="ui-home-page-project-badge">
              скоро
            </div>
          </div>
        </li>
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            Перелесник
          </div>
          <div class="ui-home-page-project-info">
            <div class="ui-home-page-project-badge">
              малюнок вогнем
            </div>
            <div class="ui-home-page-project-badge">
              скоро
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <footer class="footer">
    <a href="https://мавка.укр" target="_blank">мавка.укр</a>
  </footer>
</template>

<style lang="scss">
#app {
  width: 100%;
}

.ui-home-page {
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.ui-home-page-logo {
  margin-bottom: 2.5rem;

  display: flex;
  align-items: center;
  justify-content: center;

  img {
    height: 80px;
  }
}

.ui-home-page-projects + .ui-home-page-projects-title {
  margin-top: 2.5rem;
}

.ui-home-page-projects {
  display: flex;
  flex-direction: column;

  margin: 0;
  padding: 0;

  .ui-home-page-project {
    list-style: none;
    margin: 0;
    padding: 1rem;
    background-color: var(--card-color);
    box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
    cursor: pointer;

    transition: all 125ms ease-in-out;

    &:hover {
      background-color: var(--card-hover-color);
    }

    &:active {
      background-color: var(--card-active-color);
    }
  }

  .ui-home-page-project {
    border: 1px solid var(--border-color);
    border-top: none;
  }

  .ui-home-page-project:first-child {
    border-top: 1px solid var(--border-color);
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
  }

  .ui-home-page-project:last-child {
    border-top: none;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }

  .ui-home-page-project:only-child {
    border-top: 1px solid var(--border-color);
  }

  .ui-home-page-project-name {
    font-weight: 500;

    display: flex;
    align-items: center;

    .material-icons {
      font-size: 1rem;
      margin-right: 0.5rem;
    }
  }

  .ui-home-page-project-info {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--hint-color);
    display: flex;
    align-items: center;
  }

  .ui-home-page-project-badge {
    font-size: 0.8rem;
    height: 1.25rem;
    padding: 0 0.5rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-self: center;
    text-align: center;
    background: var(--border-color);
    width: fit-content;
    border-radius: 1rem;
  }

  .ui-home-page-project-badge + .ui-home-page-project-badge {
    margin-left: 0.25rem;
  }
}

.footer {
  margin-top: 5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;

  a {
    color: var(--hint-color);
    text-decoration: none;
  }
}
</style>
