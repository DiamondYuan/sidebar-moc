import { TocService } from "./../../services/toc-service";
import vscode from "vscode";

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
    console.log("provideCompletionItems");
    return [];
  }
}
