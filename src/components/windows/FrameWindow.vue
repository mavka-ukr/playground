<script setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { Buffer } from "buffer";

const showcaseUrl = `https://вітрина.мавка.укр`;
// const showcaseUrl = `http://localhost:3005`;

const emit = defineEmits(["frameEvent", "close"]);

const props = defineProps({
  code: String
});

const encodedCode = computed(() => Buffer.from(props.code).toString("base64"));

function handleMessageEvent(event) {
  if (event.data) {
    try {
      const data = JSON.parse(event.data);

      emit("frameEvent", data);
    } catch (e) {
      console.error(e);
    }
  }
}

onMounted(() => {
  window.addEventListener("message", handleMessageEvent, false);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", handleMessageEvent, false);
});
</script>

<template>
  <div class="ui-window">
    <div class="ui-window-header">
      <div @click="emit('close')" class="ui-window-header-close">
        <span class="material-icons">close</span>
      </div>
      <div class="ui-window-header-title">
        Вітрина
      </div>
    </div>

    <div class="ui-window-body">
      <iframe :src="`${showcaseUrl}/#code=${encodedCode}`" />
    </div>
  </div>
</template>

<style lang="scss">
.ui-window {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: var(--bg-color);

  .ui-window-header {
    height: 50px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    background: var(--card-color);
    font-weight: 500;

    .ui-window-header-close {
      width: 50px;
      height: 50px;

      display: flex;
      align-items: center;
      justify-content: center;

      font-size: 1rem;

      cursor: pointer;

      &:hover {
        background: var(--bg-color);
        color: var(--text-color);
      }
    }

    .ui-window-header-title {
      margin-left: 0.5rem;
      font-weight: 500;
      font-size: 1.2rem;
    }
  }

  .ui-window-body {
    height: calc(100% - 50px);
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}
</style>
