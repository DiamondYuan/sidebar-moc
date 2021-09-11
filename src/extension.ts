import vscode from "vscode";
import { transformMdastToMocAst } from "./transform";
import { sortRoot } from "./sort";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

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
  const ew = vscode.workspace.getConfiguration();
  channel.appendLine(ew.get("sidebar-moc.mocPath")!);
  vscode.workspace
    .openTextDocument(vscode.Uri.file(ew.get("sidebar-moc.mocPath")!))
    .then((doc) => {
      const mdast = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .parse(doc.getText());
      console.log(sortRoot(transformMdastToMocAst(mdast) as any));
    });
}
