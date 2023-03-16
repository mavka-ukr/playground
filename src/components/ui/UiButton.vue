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
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
  transition: all 125ms ease-in-out;

  &:active {
    box-shadow: none;
  }

  &.accent {
    background: #375BB6;
    color: white;

    &:active {
      box-shadow: none;
      background: darken(#375BB6, 5);
    }
  }

  &.dark {
    background: black;
    color: white;
  }
}
</style>
