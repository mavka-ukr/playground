<script setup lang="ts">
import UiDeleteIcon from "@/components/icons/UiDeleteIcon.vue";
import UiEditIcon from "@/components/icons/UiEditIcon.vue";
import { getPlayground } from "@/playground/getPlayground";
import type Project from "@/playground/Project";
import { onBeforeMount } from "vue";
import { useRouter } from "vue-router";

const P = getPlayground();

const router = useRouter();

onBeforeMount(() => {
  document.title = "Майданчик Мавки";
});

function onCreateClick() {
  const name = prompt("Введіть назву проєкту", "Новий проєкт")?.trim();

  if (name) {
    const project = P.createProject(name || "Новий проєкт");

    router.push(`/проєкт/${project.id}`);
  }
}

function onEditProjectClick(project: Project) {
  const newName = prompt("Введіть нову назву проєкту", project.name)?.trim();

  if (newName) {
    project.rename(newName);
  }
}

function onDeleteProjectClick(project: Project) {
  const confirmed = confirm(`Ви впевнені, що хочете видалити проєкт "${project.name}"?`);

  if (confirmed) {
    P.deleteProject(project.id);
  }
}
</script>

<template>
  <div class="UiHome">
    <div class="UiHomeLogo">
      <img src="/майданчик.svg" alt="Майданчик Мавки" />
    </div>

    <div class="UiHomeProjects">
      <button @click="onCreateClick" class="UiHomeProject createButton">
        <div class="UiHomeProjectIcon">+</div>

        <div class="UiHomeProjectMain">
          <div class="UiHomeProjectName">Створити</div>
        </div>
      </button>

      <RouterLink
        v-for="project in P.projects"
        :key="project.id"
        :to="`/проєкт/${project.id}`"
        class="UiHomeProject"
      >
        <div class="UiHomeProjectMain">
          <div class="UiHomeProjectName">{{ project.name }}</div>
          <div class="UiHomeProjectSubname">Змінено {{ project.lastModifiedPretty }} тому</div>
        </div>

        <div class="UiHomeProjectActions">
          <button @click.prevent.stop="onEditProjectClick(project)" class="UiHomeProjectAction">
            <UiEditIcon />
          </button>

          <button
            @click.prevent.stop="onDeleteProjectClick(project)"
            class="UiHomeProjectAction red"
          >
            <UiDeleteIcon />
          </button>
        </div>
      </RouterLink>
    </div>

    <footer>
      <div class="UiFooterTopLinks">
        <a href="https://мавка.укр">мавка.укр</a>

        <a href="https://веб.мавка.укр">веб.мавка.укр</a>
      </div>

      <a target="_blank" href="https://github.com/mavka-ukr/playground"
        >github.com/mavka-ukr/playground</a
      >
    </footer>
  </div>
</template>

<style lang="scss">
.UiHome {
  width: 100%;
  min-height: 100%;
  padding-top: 100px;
  padding-right: 1rem;
  padding-left: 1rem;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--home-bg);

  .UiHomeProjects {
    margin-top: 2rem;
    max-width: 600px;
    width: 100%;
    background-color: var((--card));
    border-radius: 1rem;
    box-shadow: var(--shadow);
  }

  .UiHomeProject {
    position: relative;
    width: 100%;
    padding: 1rem;
    display: flex;
    align-items: center;
    background-color: var(--card);
    border: none;
    font-family: inherit;
    font-size: 1rem;
    color: var(--text);
    text-decoration: none;
    cursor: pointer;

    &:first-child {
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
    }

    &:last-child {
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }

    &Main {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    &Icon {
      margin-right: 0.75rem;
      font-size: 1.25rem;
    }

    &Name {
      font-weight: 500;
    }

    &Subname {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: var(--muted);
    }

    &Actions {
      position: absolute;
      top: 50%;
      right: 1rem;
      transform: translateY(-50%);
      display: none;
      align-items: center;
    }

    &Action {
      --color: var(--text);

      margin-left: 0.25rem;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: none;
      border-radius: 50%;
      color: var(--text);
      cursor: pointer;

      &.red {
        --color: red;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
        color: var(--color);
      }
    }

    &:hover {
      background-color: var(--hover);

      .UiHomeProjectActions {
        display: flex;
      }
    }

    &:active {
      background-color: var(--press);
    }
  }

  .UiHomeProject + .UiHomeProject {
    border-top: 1px solid var(--border);
  }

  footer {
    margin-top: 100px;

    .UiFooterTopLinks {
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      justify-self: center;
      gap: 0.75rem;
    }

    span {
      margin-left: 0.5rem;
      margin-right: 0.5rem;
      font-size: 0.8rem;
      color: var(--muted);
    }

    a {
      font-size: 0.8rem;
      color: var(--muted);
    }
  }
}
</style>
