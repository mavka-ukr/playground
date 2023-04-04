import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import mavkaStartupModules from "./plugins/mavka-runtime-modules";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), mavkaStartupModules()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
