<script setup>
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiDialog from "@/components/ui/UiDialog.vue";
import { ref } from "vue";

const createDialogOpen = ref(false);

function openCreateDialog() {
  createDialogOpen.value = true;
}

function closeCreateDialog() {
  createDialogOpen.value = false;
}
</script>

<template>
  <template v-if="createDialogOpen">
    <UiDialog @close="closeCreateDialog">
      <template #head>
        <UiButton @click="closeCreateDialog">
          Скасувати
        </UiButton>
        <div class="ui-dialog-head-title">
          Новий проєкт
        </div>
        <UiButton class="accent">
          Створити
        </UiButton>
      </template>

      <UiInput />
    </UiDialog>
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
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            Лісова пісня
          </div>
          <div class="ui-home-page-project-info">
            сьогодні о 12:32
          </div>
        </li>
      </ul>
      <h3 class="ui-home-page-projects-title">
        Приклади
      </h3>
      <ul class="ui-home-page-projects">
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            Простий проєкт
          </div>
          <div class="ui-home-page-project-info">
            консольна програма
          </div>
        </li>
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            Сторінка
          </div>
          <div class="ui-home-page-project-info">
            вебсайт
          </div>
        </li>
        <li class="ui-home-page-project">
          <div class="ui-home-page-project-name">
            Телеграм-бот
          </div>
          <div class="ui-home-page-project-info">
            ну привіт...
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
#app {
  width: 100%;
}

.ui-home-page {
  max-width: 840px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 2.5rem;
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
  }

  .ui-home-page-project:first-child, {
    border-bottom: none;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
  }

  .ui-home-page-project:last-child, {
    border-top: none;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }

  .ui-home-page-project:first-child + .ui-home-page-project:last-child {
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
    margin-top: 0.25rem;
    font-size: 0.9rem;
    color: var(--hint-color);
  }
}
</style>
