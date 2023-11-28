import { computed, reactive, ref, watch } from "vue";
import axios from "axios";

export const versionsState = reactive({
  isLoadingVersions: false,
  versions: []
});

(async function() {
  versionsState.isLoadingVersions = true;

  try {
    const response = await axios.get(`https://запуск.мавка.укр/список.txt?t=${new Date().getTime()}`);
    const versionsText = response.data;

    versionsState.versions = versionsText.split("\n").filter((v) => v && v !== "остання");
  } catch (e) {
    console.error(e);
  } finally {
    versionsState.isLoadingVersions = false;
  }
})();

export const currentProjectId = ref(null);

const projects = ref(JSON.parse(localStorage.getItem("mavka_projects") || "[]"));

watch(projects, () => {
  localStorage.setItem("mavka_projects", JSON.stringify(projects.value));
}, {
  deep: true
});

function createProject(name) {
  const newProject = {
    id: (projects.value.sort((a, b) => b.id - a.id)?.[0]?.id || 0) + 1,
    name,
    date: new Date().toISOString(),
    creationDate: new Date().toISOString(),
    files: [
      {
        name: "старт.м",
        content: `
дія привітати()
  друк("Привіт від Лесі!")
кінець

привітати()
`.trim()
      }
    ]
  };

  projects.value = [
    ...projects.value,
    newProject
  ];

  return newProject;
}

function updateProject(project) {
  projects.value = [
    ...projects.value.filter((p) => p.id !== project.id),
    project
  ];
}

function deleteProject(project) {
  projects.value = projects.value.filter((p) => p.id !== project.id);
}

export function useProjects() {
  const sortedProjects = computed(() => projects.value.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)));

  return { projects: sortedProjects, createProject, updateProject, deleteProject };
}
