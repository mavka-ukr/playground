import { shallowReactive } from "vue";
import type Project from "./Project";

export default class ProjectFile {
  public readonly project: Project;
  public readonly path: string;
  protected readonly data: {
    name: string;
    content: string;
  };

  constructor(project: Project, path: string) {
    this.project = project;
    this.path = path;

    this.data = shallowReactive({
      name: path.split("/").pop() || "",
      content: localStorage.getItem(this.path) || "",
    });
  }

  public get name(): string {
    return this.data.name;
  }

  public get content(): string {
    return this.data.content;
  }

  public set content(value: string) {
    this.data.content = value;

    this.save();
  }

  protected save(): void {
    localStorage.setItem(this.path, this.data.content);

    this.project.touch();
  }
}
