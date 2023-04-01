<script setup>
import { currentProjectId, useProjects } from "@/store/projects.js";
import ProjectView from "@/views/ProjectView.vue";
import HomeView from "@/views/HomeView.vue";
import { computed } from "vue";

const { projects } = useProjects();

const project = computed(() => {
  return projects.value.find((p) => p.id === currentProjectId.value);
});
</script>

<template>
  <template v-if="currentProjectId">
    <ProjectView :project="project" />
  </template>
  <template v-else>
    <HomeView />
  </template>
</template>

<style lang="scss"></style>
