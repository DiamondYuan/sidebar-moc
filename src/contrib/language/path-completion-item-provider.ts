import { TextDocumentUtils, Brackets } from "./../../common/document";
import { TocService } from "./../../services/toc-service";
import vscode from "vscode";
import { Utils } from "vscode-uri";
export class TOCCompletionItemProvider
  implements vscode.CompletionItemProvider
{
  constructor(private tocService: TocService) {}
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const filePath = document.uri.fsPath;
    const find = this.tocService.toc.find((o) => o.uri.fsPath === filePath);
    if (!find) {
      return;
    }
    const wew = new TextDocumentUtils(document);
    const range = wew.growBracketsRange(position, Brackets.ROUND);
    if (!range) {
      return;
    }
    const path = document.getText(range).slice(1, -1);
    if (
      !path.startsWith("./") &&
      !path.startsWith("../") &&
      !path.startsWith(".\\") &&
      !path.startsWith("..\\")
    ) {
      return;
    }
    const fs = vscode.workspace.fs;
    const currentPath = Utils.joinPath(Utils.dirname(document.uri), path);
    try {
      const stat = await fs.stat(currentPath);
      if (stat.type === vscode.FileType.Directory) {
        const files = await fs.readDirectory(currentPath);
        return files.map(
          (p) =>
            new vscode.CompletionItem(
              p[0],
              [
                vscode.CompletionItemKind.Issue,
                vscode.CompletionItemKind.File,
                vscode.CompletionItemKind.Folder,
              ][p[1]]
            )
        );
      }
    } catch (error) {
      return [];
    }
  }
}
