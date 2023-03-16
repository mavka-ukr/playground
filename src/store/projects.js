import { computed, ref, watch } from "vue";

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
