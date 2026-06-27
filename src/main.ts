import "./assets/main.scss";

import "dayjs/locale/uk";

import dayjs from "dayjs";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "dayjs/locale/uk";
import isToday from "dayjs/plugin/isToday.js";
import isYesterday from "dayjs/plugin/isYesterday.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(localizedFormat);
dayjs.locale("uk");

const app = createApp(App);

app.use(router);

app.mount("#app");
