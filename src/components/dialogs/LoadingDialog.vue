<script setup>
import UiDialog from "@/components/ui/UiDialog.vue";</script>

<template>
  <UiDialog>
    <template #head>
      <div class="ui-dialog-head-title">
        Завантаження модуля
      </div>
    </template>

    <slot />
  </UiDialog>
</template>
