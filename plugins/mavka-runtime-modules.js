import startupModules from "mavka/startup-modules";
import { Buffer } from "buffer";

const playgroundStartupModules = startupModules.filter((m) => m.name !== "фс.м");

export default function mavkaStartupModules() {
  const virtualModuleId = "virtual:mavka-startup-modules";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "mavka-startup-modules", // required, will show up in warnings and errors
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        if (!Array.isArray(playgroundStartupModules)) {
          throw `Не вдалось завантажити вбудовані модулі.`;
        }

        const json = JSON.stringify(playgroundStartupModules);
        const encoded = Buffer.from(json.replaceAll("\\", "\\\\")).toString("base64");

        return `export default "${encoded}"`;
      }
    }
  };
}
