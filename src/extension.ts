import vscode from "vscode";

class TreeViewItem extends vscode.TreeItem {
  constructor(data: { title: string; link: string }) {
    super(data.title);
  }
}

class DataProvider implements vscode.TreeDataProvider<TreeViewItem> {
  constructor() {}
  getTreeItem(
    element: TreeViewItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(element?: TreeViewItem): vscode.ProviderResult<TreeViewItem[]> {
    return [];
  }
}

export function activate(context: vscode.ExtensionContext) {
  vscode.window.createTreeView("sidebar-moc.view", {
    treeDataProvider: new DataProvider(),
  });
  const channel = vscode.window.createOutputChannel("Sidebar MOC");
  channel.appendLine("Hello World");
}
