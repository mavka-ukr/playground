<script setup lang="ts">
import { onBeforeMount } from "vue";
import { RouterView } from "vue-router";
import { getPlayground } from "./playground/getPlayground";

const P = getPlayground();

onBeforeMount(() => {
  P.init();
});
</script>

<template>
  <RouterView />
</template>

<style lang="scss"></style>
