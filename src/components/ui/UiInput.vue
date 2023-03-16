<script setup>
import { computed } from "vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: String
});

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  }
});
</script>

<template>
  <input v-model="value" class="ui-input" type="text">
</template>

<style lang="scss">
.ui-input {
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-family: Rubik, sans-serif;
  font-size: 0.9rem;
  width: 100%;
  background: var(--card-color);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
  outline: none;

  color: var(--text-color);

  &::placeholder {
    color: var(--hint-color);
  }
}
</style>
