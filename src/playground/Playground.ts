import { shallowReactive } from "vue";
import Project from "./Project";

export type TPlaygroundMavkaVersion = {
  mavka: string;
  pkg: string;
};

export default class Playground {
  protected readonly data: {
    projects: Project[];
    mavkaVersions: TPlaygroundMavkaVersion[];
  };

  constructor() {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const mavkaVersions = JSON.parse(localStorage.getItem("mavkaVersions") || "[]");

    this.data = shallowReactive({
      projects: projects.map((id: string) => new Project(this, id)),
      mavkaVersions: mavkaVersions,
    });
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
    this.data.mavkaVersions = await Mavka.fetchAvailableVersions();
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
    file1.content = `взяти модуль ракета [Ракета]

реакція = Ракета(
  назва="Вікторія",
  швидкість=299792458,
  маса=недійсне,
)

реакція.запустити()
`;

    const file2 = project.createFile("ракета.м");
    file2.content = `клас Ракета
  дія чародія(назва, швидкість, маса)
    я.назва = назва
    я.швидкість = швидкість
    я.маса = маса або 0
  кінець

  дія запустити()
    друк("Ракету %(я.назва) запущено!")
  кінець
кінець

дати Ракета
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
