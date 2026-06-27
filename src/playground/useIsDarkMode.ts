import { computed, ref, watch } from "vue";

const isAuto = ref(true);
const isDarkMode = ref(false);

watch(
  () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  (newValue) => {
    if (isAuto.value) {
      isDarkMode.value = newValue;
    }
  },
  { immediate: true },
);

watch(
  isDarkMode,
  (newValue) => {
    if (newValue) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
  { immediate: true },
);

export function useIsDarkMode() {
  return computed(() => isDarkMode.value);
}
