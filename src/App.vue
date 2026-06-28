<script setup lang="ts">
import { onBeforeMount } from "vue";
import { RouterView } from "vue-router";
import { getPlayground } from "./playground/getPlayground";

const P = getPlayground();

onBeforeMount(() => {
  P.init().then(() => {
    document.querySelector(".UiAppLoading")?.remove();
  });
});
</script>

<template>
  <RouterView v-if="P.isInited" />
</template>

<style lang="scss"></style>
