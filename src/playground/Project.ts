import dayjs from "dayjs";
import { shallowReactive } from "vue";
import type Playground from "./Playground";
import ProjectFile from "./ProjectFile";

export default class Project {
  public readonly id: string;
  protected readonly data: {
    name: string;
    files: ProjectFile[];
    lastModified: number;
    mavkaVersion: string;
    mainFile?: ProjectFile;
  };

  constructor(playground: Playground, id: string) {
    this.id = id;

    const project = JSON.parse(localStorage.getItem(this.id) || "{}");

    this.data = shallowReactive({
      name: project.name || "",
      files: (project.files || []).map((file: string) => new ProjectFile(this, file)),
      lastModified: project.lastModified || Date.now(),
      mavkaVersion: project.mavkaVersion || playground.mavkaVersions[0]?.mavka || "0.125.7",
      mainFile: undefined,
    });

    this.data.mainFile = this.data.files.find((file) => file.path === project.mainFile);
  }

  public get name(): string {
    return this.data.name;
  }

  public set name(value: string) {
    this.data.name = value;

    this.save();
  }

  public get files(): ProjectFile[] {
    return this.data.files;
  }

  public get lastModified(): number {
    return this.data.lastModified;
  }

  public get lastModifiedPretty(): string {
    const djs = dayjs(this.lastModified);

    if (djs.isToday()) {
      return `${djs.fromNow(true)}`;
    } else if (djs.isYesterday()) {
      return `вчора о ${djs.format("LT")}`;
    } else if (djs.year() === dayjs().year()) {
      return djs.format("D MMMM LT");
    } else {
      return djs.format("lll");
    }
  }

  public get mavkaVersion(): string {
    return this.data.mavkaVersion;
  }

  public set mavkaVersion(value: string) {
    this.data.mavkaVersion = value;

    this.save();
  }

  public get mainFile(): ProjectFile | undefined {
    return this.data.mainFile;
  }

  public set mainFile(value: ProjectFile | undefined) {
    this.data.mainFile = value;

    this.save();
  }

  protected save(): void {
    this.data.lastModified = Date.now();

    localStorage.setItem(
      this.id,
      JSON.stringify({
        name: this.data.name,
        files: this.data.files.map((file) => file.path),
        lastModified: this.data.lastModified,
        mavkaVersion: this.data.mavkaVersion,
        mainFile: this.data.mainFile ? this.data.mainFile.path : null,
      }),
    );
  }

  public touch(): void {
    this.save();
  }

  public rename(newName: string): void {
    this.data.name = newName;

    this.save();
  }

  public createFile(name: string): ProjectFile {
    const filePath = `${this.id}/${name}`;

    const file = new ProjectFile(this, filePath);

    this.data.files = [...this.data.files, file];

    if (!this.data.mainFile) {
      this.data.mainFile = file;
    }

    this.save();

    return file;
  }

  public deleteFile(name: string): void {
    const file = this.files.find((file) => file.path === `${this.id}/${name}`);
    if (!file) {
      throw new Error(`File "${name}" not found in project "${this.id}"`);
    }

    this.data.files = this.data.files.filter((file) => file.path !== `${this.id}/${name}`);

    if (this.data.mainFile === file) {
      this.data.mainFile = this.data.files[0];
    }

    localStorage.removeItem(file.path);

    this.save();
  }

  public renameFile(oldName: string, newName: string): ProjectFile {
    const oldFile = this.files.find((file) => file.path === `${this.id}/${oldName}`);
    if (!oldFile) {
      throw new Error(`File "${oldName}" not found in project "${this.id}"`);
    }

    const newFile = new ProjectFile(this, `${this.id}/${newName}`);

    newFile.content = oldFile.content;

    localStorage.removeItem(oldFile.path);

    this.data.files = this.data.files.map((file) => (file === oldFile ? newFile : file));

    if (this.data.mainFile === oldFile) {
      this.data.mainFile = newFile;
    }

    this.save();

    return newFile;
  }
}
