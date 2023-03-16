<script setup>
import { currentProjectId, useProject } from "@/store/projects.js";
import ProjectView from "@/views/ProjectView.vue";
import HomeView from "@/views/HomeView.vue";

const { project: currentProject } = useProject(currentProjectId);
</script>

<template>
  <template v-if="currentProjectId">
    <ProjectView :project="currentProject" />
  </template>
  <template v-else>
    <HomeView />
  </template>
</template>

<style lang="scss"></style>
