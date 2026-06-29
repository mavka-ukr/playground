import { shallowReactive } from "vue";
import Project from "./Project";

export type TPlaygroundMavkaVersion = {
  mavka: string;
  pkg: string;
};

export default class Playground {
  protected readonly data: {
    isInited: boolean;
    projects: Project[];
    mavkaVersions: TPlaygroundMavkaVersion[];
  };

  constructor() {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const mavkaVersions = JSON.parse(localStorage.getItem("mavkaVersions") || "[]");

    this.data = shallowReactive({
      isInited: false,
      projects: projects.map((id: string) => new Project(this, id)),
      mavkaVersions: mavkaVersions,
    });
  }

  public get isInited() {
    return this.data.isInited;
  }

  public get projects(): Project[] {
    return [...this.data.projects].sort((a, b) => b.lastModified - a.lastModified);
  }

  public get mavkaVersions(): TPlaygroundMavkaVersion[] {
    return this.data.mavkaVersions;
  }

  protected save(): void {
    localStorage.setItem(
      "projects",
      JSON.stringify(this.data.projects.map((project) => project.id)),
    );
    localStorage.setItem("mavkaVersions", JSON.stringify(this.data.mavkaVersions));
  }

  public async init(): Promise<void> {
    return new Promise((res, rej) => {
      if (this.data.isInited) {
        res();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://веб.мавка.укр/mavka_web.js?d=" + Date.now();
      script.async = true;

      script.onload = async () => {
        try {
          const rawVersions: { pkg: string; mavka: string }[] = await Mavka.fetchAvailableVersions();

          const semverCompare = (a: string, b: string) => {
            const pa = a.split('.').map(Number);
            const pb = b.split('.').map(Number);
            for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
              const na = pa[i] || 0;
              const nb = pb[i] || 0;
              if (na !== nb) return na - nb;
            }
            return 0;
          };

          const seen = new Set();
          this.data.mavkaVersions = rawVersions
            .sort((a, b) => semverCompare(b.pkg, a.pkg))
            .filter((item) => {
              const version = item.mavka.trim();
              if (seen.has(version)) return false;
              seen.add(version);
              return true;
            });

          localStorage.setItem("mavkaVersions", JSON.stringify(this.data.mavkaVersions));

          this.data.isInited = true;

          res();
        } catch (e) {
          rej(e);
        }
      };

      script.onerror = (e) => {
        rej(e);
      };

      document.head.appendChild(script);
    });
  }

  public getNewProjectId(name: string): string {
    name = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яіїєґ]+/g, "-");

    const existingIds = new Set(this.data.projects.map((project) => project.id));

    if (existingIds.has(name)) {
      let suffix = 1;
      while (existingIds.has(`${name}-${suffix}`)) {
        suffix++;
      }

      if (suffix > 0) {
        name = `${name}-${suffix}`;
      }
    }

    return `${name}`;
  }

  public createProject(name: string): Project {
    const id = this.getNewProjectId(name);

    const project = new Project(this, id);
    project.name = name;

    const file1 = project.createFile("початок.м");
    file1.content = `взяти модуль планета [Планета]

земля = Планета(
  назва="Земля",
  маса=5.972е24,
  радіус=6371000
)

друк(земля.сила_тяжіння(65))
`;

    const file2 = project.createFile("планета.м");
    file2.content = `клас Планета
  дія чародія(назва, маса, радіус)
    я.назва = назва
    я.маса = маса
    я.радіус = радіус
  кінець

  дія г()
    6.6743е-11 * (я.маса / (я.радіус * я.радіус))
  кінець

  дія сила_тяжіння(м)
    м * я.г()
  кінець
кінець

дати Планета
`;

    this.data.projects = [project, ...this.data.projects];

    this.save();

    return project;
  }

  public deleteProject(id: string): void {
    const project = this.data.projects.find((project) => project.id === id);
    if (!project) {
      return;
    }

    this.data.projects = this.data.projects.filter((project) => project.id !== id);

    project.files.forEach((file) => {
      project.deleteFile(file.name);
    });

    localStorage.removeItem(project.id);

    this.save();
  }
}
