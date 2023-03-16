import { ref, watch } from "vue";

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
      files: []
    }
  ];
}

export function useProjects() {
  return { projects, createProject };
}
