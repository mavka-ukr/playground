<script setup>
import UiDialog from "@/components/ui/UiDialog.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import { ref } from "vue";
import { useProjects } from "@/store/projects.js";

const emit = defineEmits(["close"]);

const { createProject } = useProjects();

const newProjectName = ref("");

function close() {
  emit("close");
}

function create() {
  console.log(newProjectName.value);
  if (!newProjectName.value.trim()) {
    return;
  }

  createProject(newProjectName.value);
  close();
}
</script>

<template>
  <UiDialog @close="close">
    <template #head>
      <UiButton @click="close">
        Скасувати
      </UiButton>
      <div class="ui-dialog-head-title">
        Новий проєкт
      </div>
      <UiButton @click="create" class="accent">
        Створити
      </UiButton>
    </template>

    <UiInput v-model="newProjectName" placeholder="Назва" />
  </UiDialog>
</template>
