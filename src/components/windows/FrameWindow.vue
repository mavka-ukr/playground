<script setup>
defineProps({
  code: String
});
</script>

<template>
  <div class="ui-window">
    <div class="ui-window-header">
      Window X
    </div>

    <div class="ui-window-body">
      <iframe :src="`/window.html#code=${encodeURIComponent(code)}`" />
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
    padding: 0 1rem;
    font-weight: 500;
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
