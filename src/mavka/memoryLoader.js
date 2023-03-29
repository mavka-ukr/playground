import { parse } from "mavka-parser";
import axios from "axios";

class MemoryLoader {
  constructor(mavka, files = {}) {
    this.mavka = mavka;
    this.files = files;
    this.loadedModules = {};
    this.loadedRemoteModules = {};
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


  /**
   * Load remote file.
   *
   * @param {Context} context
   * @param {string} url
   * @param {Object} options
   */
  async loadRemote(context, url, options = {}) {
    const rawUrl = url;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    let module = this.loadedRemoteModules[rawUrl];

    if (!this.loadedRemoteModules[rawUrl]) {
      const moduleContext = new this.mavka.Context(this.mavka, context);
      moduleContext.setAsync(true);

      const moduleCode = await axios
        .get(url, {
          onDownloadProgress: (progressEvent) => {
            if (options.onProgress) {
              options.onProgress(Math.floor(progressEvent.progress * 100));
            }
          },
          responseType: "text"
        })
        .then((r) => String(r.data))
        .catch((e) => {
          if (options.onFailed) {
            options.onFailed(e);
          }

          this.mavka.fall(context, this.mavka.makeText(`Не вдалось завантажити "${rawUrl}".`));
        });

      const moduleProgram = parse(moduleCode);

      module = this.mavka.makeModule("");
      moduleContext.setModule(module);

      this.loadedRemoteModules[rawUrl] = module;

      await this.mavka.run(moduleContext, moduleProgram.body);
    }

    Object.entries(module.properties).forEach(([key, value]) => {
      context.set(key, value);
    });
  }
}

export default MemoryLoader;
