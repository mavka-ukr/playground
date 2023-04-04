import startupModules from 'mavka/startup-modules';
import { Buffer } from 'buffer';

export default function mavkaStartupModules() {
  const virtualModuleId = 'virtual:mavka-startup-modules'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'mavka-startup-modules', // required, will show up in warnings and errors
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        if (!Array.isArray(startupModules)) {
          throw `Не вдалось завантажити вбудовані модулі.`;
        }
      
        const json = JSON.stringify(startupModules);
        const encoded = Buffer.from(json.replaceAll('\\', '\\\\')).toString("base64");

        return `export default "${encoded}"`
      }
    },
  }
}