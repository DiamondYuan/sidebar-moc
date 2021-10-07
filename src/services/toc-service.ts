import { IPathService } from "./path";
import vscode from "vscode";
import { OutlineRoot, OutlineDataWithUri } from "../types";
import { loadAndParse } from "../common/load-and-parse";

export class TocService {
  public toc: OutlineDataWithUri[];
  private handler: () => void = () => {};

  constructor(private pathService: IPathService) {
    this.toc = [];
  }

  onTocChange(handler: () => void): void {
    this.handler = handler;
  }

  async updateConfig(files: string[]) {
    const toc: OutlineDataWithUri[] = [];
    for (const iterator of files.map((p) =>
      this.pathService.configPathToUri(p)
    )) {
      try {
        const uri = vscode.Uri.file(iterator);
        const root = (await loadAndParse(uri)) as any as OutlineRoot;
        toc.push({
          uri,
          data: root,
        });
      } catch (error) {}
    }
    this.toc = toc;
    this.handler();
  }

  async updateToc(file: vscode.Uri) {
    const index = this.toc.findIndex((p) => p.uri.fsPath === file.fsPath);
    if (index !== -1) {
      try {
        const root = await loadAndParse(file);
        this.toc[index] = {
          uri: file,
          data: root,
        };
      } catch (error) {}
      this.handler();
    }
  }
}
