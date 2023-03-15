<template>
  <button class="ui-button">
    <slot />
  </button>
</template>

<style lang="scss">
.ui-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-family: Rubik, sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  background: var(--card-color);
  color: var(--text-color);
  cursor: pointer;

  &.accent {
    background: #375BB6;
    color: white;
  }

  &.dark {
    background: black;
    color: white;
  }
}
</style>
