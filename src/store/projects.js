import { computed, ref, unref, watch } from "vue";

export const currentProjectId = ref(null);

const projects = ref(JSON.parse(localStorage.getItem("mavka_projects") || "[]"));

watch(projects, () => {
  localStorage.setItem("mavka_projects", JSON.stringify(projects.value));
});

function createProject(name) {
  projects.value = [
    ...projects.value,
    {
      id: (projects.value.sort((a, b) => b.id - a.id)?.[0]?.id || 0) + 1,
      name,
      date: new Date().toISOString(),
      creationDate: new Date().toISOString(),
      files: [
        {
          name: "старт.м",
          content: ""
        }
      ]
    }
  ];
}

function updateProject(project) {
  projects.value = [
    ...projects.value.filter((p) => p.id !== project.id),
    project
  ];
}

export function useProjects() {
  const sortedProjects = computed(() => projects.value.sort((a, b) => new Date(b.date) - new Date(a.date)));

  return { projects: sortedProjects, createProject, updateProject };
}

export function useProject(id) {
  const project = computed(() => {
    id = unref(id);

    return projects.value.find((p) => p.id === id);
  });

  return { project };
}
