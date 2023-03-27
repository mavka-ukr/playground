import { parse } from "mavka-parser";

class MemoryLoader {
  constructor(mavka, files = {}) {
    this.mavka = mavka;
    this.files = files;
    this.loadedModules = {};
  }

  async loadModule(context, path, absolute = false) {
    let name = path[0];
    const newPath = path.slice(1);

    if (!(name in this.files)) {
      throw `Не вдалось завантажити модуль "${name}."`;
    }

    let module;

    if (this.loadedModules[name]) {
      module = this.loadedModules[name];
    } else {
      const moduleContext = new this.mavka.Context(this.mavka, this.mavka.context);
      moduleContext.setAsync(true);

      const moduleCode = this.files[name];
      const moduleProgram = parse(moduleCode);

      module = this.mavka.makeModule(name);
      moduleContext.setModule(module);

      this.loadedModules[name] = module;

      await this.mavka.run(moduleContext, moduleProgram.body);
    }

    let result = module;

    if (newPath.length) {
      let first = newPath.shift();
      while (first) {
        name = first;
        if (result instanceof this.mavka.Context) {
          result = result.get(first);
        } else {
          result = result.get(context, first);
        }
        first = newPath.shift();
      }
    }

    return { name, result };
  }

  async loadPak(context, pathElements) {
    this.mavka.fall(context, this.mavka.makeText("Завантаження паків ще не підтримується."));
  }

  async loadRemote(context, url) {
    this.mavka.fall(context, this.mavka.makeText("Завантаження модулів з інтернету ще не підтримується."));
  }
}

export default MemoryLoader;
