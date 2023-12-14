<script setup>
import { onMounted, ref } from "vue";
import NewProjectDialog from "@/components/dialogs/NewProjectDialog.vue";
import { currentProjectId, useProjects } from "@/store/projects.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RUN_MAVKA_URL } from "../globals.js";

dayjs.extend(relativeTime);

const { projects, deleteProject, createProject } = useProjects();

const createDialogOpen = ref(false);
const version = ref("а.б.в");

onMounted(() => {
  fetch(`${RUN_MAVKA_URL}/список.txt?t=${new Date().getTime()}`)
    .then((r) => r.text())
    .then((t) => t.split("\n")[1])
    .then((v) => version.value = v);
});

function openCreateDialog() {
  createDialogOpen.value = true;
}

function closeCreateDialog() {
  createDialogOpen.value = false;
}

function openProject(project) {
  currentProjectId.value = project.id;
}

function removeProject(project) {
  if (window.confirm("Дійсно видалити цей проєкт?")) {
    deleteProject(project);
  }
}

function createHelloFromLesia() {
  const newProject = createProject("Привіт від Лесі");
  currentProjectId.value = newProject.id;
}

function createTelegramBot() {
  const newProject = createProject("Телеграм-бот", `
взяти "запит"
взяти "json"
взяти "читати"

ТОКЕН = читати("ТОКЕН: ")
УРЛ = "https://api.telegram.org/bot%(ТОКЕН)"

працює = так
останнє_оновлення = пусто

тривала дія виконати_метод(назва текст, параметри словник = ()) щось
  чекати відповідь = запит.надіслати(
    "POST",
    УРЛ + "/" + назва,
    ("content-type"="application/json"),
    json.stringify(параметри)
  )
  вернути json.parse(текст(відповідь.дані))
кінець

чекати me = виконати_метод("getMe")
якщо me["ok"]
  друк("Бот:", me["result"])
інакше
  впасти """Помилка отримання інформації про бота: %(me["description"])"""
кінець

поки працює
  якщо останнє_оновлення
    чекати дані = виконати_метод("getUpdates", (offset=(останнє_оновлення["update_id"] + 1)))
  інакше
    чекати дані = виконати_метод("getUpdates")
  кінець

  якщо !дані["ok"]
    впасти """Помилка отримання оновлень: %(дані["description"])"""
  інакше
    оновлення = дані["result"]

    перебрати оновлення як о
      останнє_оновлення = о

      друк("Оновлення:", о)

      якщо останнє_оновлення["message"]
        якщо останнє_оновлення["message"]["text"] == "/start"
          чекати виконати_метод("sendMessage", (
            chat_id=останнє_оновлення["message"]["chat"]["id"],
            text="Привіт!"
          ))
        кінець
      кінець
    кінець
  кінець
кінець
`.trim());
  currentProjectId.value = newProject.id;
}
</script>

<template>
  <template v-if="createDialogOpen">
    <NewProjectDialog @close="closeCreateDialog" />
  </template>

  <div class="ui-home-page">
    <div class="ui-home-page-logo">
      <img src="@/assets/images/logo.png" alt="Logo">
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
            <div @click.stop.prevent="removeProject(project)" class="ui-home-page-project-delete-button">
              <span class="material-icons">delete</span>
            </div>
          </li>
        </template>
      </ul>
      <h3 class="ui-home-page-projects-title">
        Приклади
      </h3>
      <ul class="ui-home-page-projects">
        <li class="ui-home-page-project" @click="createHelloFromLesia">
          <div class="ui-home-page-project-name">
            Привіт від Лесі
          </div>
          <div class="ui-home-page-project-info">
            <div class="ui-home-page-project-badge">
              консольна програма
            </div>
          </div>
          <div class="ui-home-page-project-delete-button create">
            <span class="material-icons">add</span>
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
        <li class="ui-home-page-project" @click="createTelegramBot">
          <div class="ui-home-page-project-name">
            Телеграм-бот
          </div>
          <div class="ui-home-page-project-info">
            <div class="ui-home-page-project-badge">
              консольна програма
            </div>
          </div>
          <div class="ui-home-page-project-delete-button create">
            <span class="material-icons">add</span>
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
    <span class="footer-version">({{ version }})</span>
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
    position: relative;
    list-style: none;
    margin: 0;
    padding: 1rem;
    background-color: var(--card-color);
    box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
    cursor: pointer;

    transition: all 125ms ease-in-out;

    .ui-home-page-project-delete-button {
      position: absolute;
      right: 1rem;
      top: calc(50% - 0.75rem);
      height: 1.5rem;
      width: 1.5rem;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--hint-color);
      border-radius: 50%;
      user-select: none;

      .material-icons {
        font-size: 1rem;
      }

      &:hover {
        background: rgba(red, 0.25);
        color: red;
      }

      &.create:hover {
        background: rgba(green, 0.25);
        color: green;
      }
    }

    &:hover {
      background-color: var(--card-hover-color);

      .ui-home-page-project-delete-button {
        display: flex;
      }
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

  .footer-version {
    font-size: 0.8rem;
    color: var(--hint-color);
    margin-left: 0.5rem;
  }
}
</style>
