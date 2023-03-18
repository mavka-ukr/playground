<script setup>
import UiDialog from "@/components/ui/UiDialog.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import { ref } from "vue";

const emit = defineEmits(["close", "save"]);

const newFileName = ref("");

function close() {
  emit("close");
}

function create() {
  if (!newFileName.value.trim()) {
    return;
  }

  emit("save", { name: newFileName.value });
}
</script>

<template>
  <UiDialog @close="close">
    <template #head>
      <UiButton @click="close">
        Скасувати
      </UiButton>
      <div class="ui-dialog-head-title">
        Новий модуль
      </div>
      <UiButton @click="create" class="accent">
        Створити
      </UiButton>
    </template>

    <UiInput v-model="newFileName" placeholder="Назва" />
  </UiDialog>
</template>
