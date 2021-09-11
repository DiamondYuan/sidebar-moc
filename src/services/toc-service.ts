import vscode, { Uri } from "vscode";
import { OutlineContent, OutlineRoot, Point } from "../types";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { sortRoot } from "../sort";
import { transformMdastToMocAst } from "../transform";

export class TocService {
  public toc: OutlineRoot[];
  private files: string[] = [];
  private handler: () => void = () => {};

  constructor() {
    this.toc = [];
    this.files = [];
  }

  onTocChange(handler: () => void): void {
    this.handler = handler;
  }

  async updateConfig(files: string[]) {
    const toc = [];
    for (const iterator of files) {
      const root = (await loadAndParse(iterator)) as any as OutlineRoot;
      toc.push(root);
    }
    this.toc = toc;
    this.files = files;
    this.handler();
  }

  async updateToc(file: vscode.Uri) {
    const index = this.files.indexOf(file.fsPath);
    if (index !== -1) {
      const root = (await loadAndParse(file.fsPath)) as any as OutlineRoot;
      this.toc[index] = root;
      this.handler();
    }
  }
}

function loadAndParse(url: string): Promise<OutlineContent> {
  return new Promise<OutlineContent>((r) => {
    vscode.workspace.openTextDocument(vscode.Uri.file(url)).then((doc) => {
      const mdast = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .parse(doc.getText());
      const root = sortRoot(transformMdastToMocAst(mdast) as any) as any;
      r(root);
    });
  });
}
