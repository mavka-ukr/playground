import { createApp } from "vue";
import App from "@/App.vue";

import "@/assets/main.scss";

import "@/plugins/cssprops.js";

const app = createApp(App);

app.mount("#app");
