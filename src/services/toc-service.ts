import vscode from "vscode";
import { OutlineContent, OutlineRoot, OutlineDataWithUri } from "../types";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { sortRoot } from "../sort";
import { transformMdastToMocAst } from "../transform";

export class TocService {
  public toc: OutlineDataWithUri[];
  private handler: () => void = () => {};

  constructor() {
    this.toc = [];
  }

  onTocChange(handler: () => void): void {
    this.handler = handler;
  }

  async updateConfig(files: string[]) {
    const toc: OutlineDataWithUri[] = [];
    for (const iterator of files) {
      const uri = vscode.Uri.file(iterator);
      const root = (await loadAndParse(uri)) as any as OutlineRoot;
      toc.push({
        uri,
        data: root,
      });
    }
    this.toc = toc;
    this.handler();
  }

  async updateToc(file: vscode.Uri) {
    const index = this.toc.findIndex((p) => p.uri.fsPath === file.fsPath);
    if (index !== -1) {
      const root = await loadAndParse(file);
      this.toc[index] = {
        uri: file,
        data: root,
      };
      this.handler();
    }
  }
}

function loadAndParse(uri: vscode.Uri): Promise<OutlineContent> {
  return new Promise<OutlineContent>((r) => {
    vscode.workspace.openTextDocument(uri).then((doc) => {
      const mdast = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .parse(doc.getText());
      const root = sortRoot(transformMdastToMocAst(mdast) as any) as any;
      r(root);
    });
  });
}
