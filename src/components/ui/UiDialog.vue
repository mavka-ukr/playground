<script setup>
defineEmits(["close"]);
</script>

<template>
  <Teleport to="body">
    <div class="ui-dialog-wrapper">
      <div @click="$emit('close')" class="ui-dialog-backdrop" />

      <div class="ui-dialog">
        <div class="ui-dialog-head">
          <slot name="head" />
        </div>
        <div class="ui-dialog-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
.ui-dialog-wrapper {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(0.5rem);
}

.ui-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: var(--text-color);
  opacity: 0.1;
}

.ui-dialog {
  position: absolute;
  margin: 0 auto;
  max-width: 500px;
  width: 100%;
  background: var(--bg-color);
  border-radius: 0.75rem;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
}

.ui-dialog-head {
  position: relative;

  padding: 0.75rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ui-dialog-head-title {
  position: absolute;
  top: 50%;
  left: 50%;

  font-weight: 500;

  transform: translate(-50%, -50%);
}

.ui-dialog-body {
  padding: 0.75rem;
  padding-top: 0;
}
</style>
