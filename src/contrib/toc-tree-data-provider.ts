import { TocService } from "./../services/toc-service";
import { OutlineDataWithUri } from "./../types";
import vscode from "vscode";
import { Utils } from "vscode-uri";

function getLabel(element: OutlineDataWithUri) {
  const data = element.data;
  if (data.type === "root") {
    return Utils.basename(element.uri);
  }
  return data.text ?? "Undefined";
}

function getIcon(element: OutlineDataWithUri) {
  const data = element.data;
  if (data.type === "root") {
    return new vscode.ThemeIcon("output-view-icon");
  }
  if (!data.url) {
    return new vscode.ThemeIcon("edit");
  }
  if (data.url.startsWith("http")) {
    return new vscode.ThemeIcon("link");
  }
  return new vscode.ThemeIcon("go-to-file");
}

class TreeViewItem extends vscode.TreeItem {
  constructor(element: OutlineDataWithUri) {
    super(
      getLabel(element),
      element.data.children.length === 0
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Expanded
    );
    this.iconPath = getIcon(element);
    this.tooltip = element.uri.fsPath;
    this.command = {
      command: "sidebar-moc.open-uri",
      title: "Open",
      arguments: [{ outlineData: element.data, uri: element.uri.fsPath }],
    };
  }
}

export class TOCTreeDataProvider
  implements vscode.TreeDataProvider<OutlineDataWithUri>
{
  constructor(private tocService: TocService) {}

  private _onDidChangeTreeData: vscode.EventEmitter<undefined | void> =
    new vscode.EventEmitter<undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<undefined | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(
    element: OutlineDataWithUri
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return new TreeViewItem(element);
  }

  getChildren(
    element?: OutlineDataWithUri
  ): vscode.ProviderResult<OutlineDataWithUri[]> {
    if (!element) {
      return this.tocService.toc;
    }
    return element.data.children.map((p) => ({
      uri: element.uri,
      data: p,
    }));
  }
}
