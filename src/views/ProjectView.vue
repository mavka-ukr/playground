<script setup>
import { useProjects } from "@/store/projects.js";
import { onMounted, toRefs } from "vue";

const props = defineProps({
  project: Object
});
const { project } = toRefs(props);

const { updateProject } = useProjects();

onMounted(() => {
  updateProject({
    ...project.value,
    date: new Date().toISOString()
  });
});
</script>

<template>
  <div class="ui-project-page">
    {{ project }}
  </div>
</template>
