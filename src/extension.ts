import { OutlineContent, OutlineRoot, Point } from "./types";
import vscode from "vscode";
import { transformMdastToMocAst } from "./transform";
import { sortRoot } from "./sort";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { Utils } from "vscode-uri";
class TreeViewItem extends vscode.TreeItem {
  constructor(
    element: OutlineContent,
    private context: vscode.ExtensionContext
  ) {
    super(
      element.text ?? "NONE",
      element.children.length === 0
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Expanded
    );
    this.iconPath = this.getIcon(element);
    this.tooltip = element.url;
    this.command = {
      command: "sidebar-moc.open-uri",
      title: "Open",
      arguments: [{ url: element.url, point: element.startPoint }],
    };
  }

  private getIcon(element: OutlineContent) {
    if (element.url?.startsWith("http")) {
      return vscode.Uri.joinPath(
        this.context.extensionUri,
        "resource/icon/url.svg"
      );
    }
    if (!element.url) {
      return vscode.Uri.joinPath(
        this.context.extensionUri,
        "resource/icon/folder.svg"
      );
    }
    return vscode.Uri.joinPath(
      this.context.extensionUri,
      "resource/icon/file.svg"
    );
  }
}

class DataProvider implements vscode.TreeDataProvider<OutlineContent> {
  constructor(
    private context: vscode.ExtensionContext,
    private root: OutlineContent | OutlineRoot
  ) {}

  private _onDidChangeTreeData: vscode.EventEmitter<undefined | void> =
    new vscode.EventEmitter<undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<undefined | void> =
    this._onDidChangeTreeData.event;

  refresh(root: OutlineContent): void {
    this.root = root;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(
    element: OutlineContent
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return new TreeViewItem(element, this.context);
  }

  getChildren(
    element?: OutlineContent
  ): vscode.ProviderResult<OutlineContent[]> {
    if (!element) {
      return this.root.children;
    }
    return element.children;
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

export async function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration();
  const mocPath: string | undefined = config.get("sidebar-moc.mocPath");
  const treeDataProvider = new DataProvider(context, {
    type: "root",
    children: [],
  });
  vscode.window.createTreeView("sidebar-moc.view", {
    treeDataProvider: treeDataProvider,
  });

  if (mocPath) {
    const root = await loadAndParse(mocPath);
    treeDataProvider.refresh(root);
  }
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.md");
  watcher.onDidChange(async (e) => {
    if (!mocPath) {
      return;
    }
    if (e.path === mocPath) {
      const root = await loadAndParse(mocPath);
      treeDataProvider.refresh(root);
    }
  });
  vscode.commands.registerCommand(
    "sidebar-moc.open-uri",
    (file: { url: string; point: Point }) => {
      if (!mocPath) {
        return;
      }
      const mocURI = vscode.Uri.file(mocPath);
      if (!file.url) {
        openAndShow(mocURI, file.point);
        return;
      }
      if (file.url.startsWith("http")) {
        vscode.env.openExternal(vscode.Uri.parse(file.url));
      }
      const fileUrI = vscode.Uri.joinPath(Utils.dirname(mocURI), file.url);
      openAndShow(fileUrI);
    }
  );
}

function openAndShow(file: vscode.Uri, point?: Point) {
  vscode.workspace.openTextDocument(file).then(
    (a: vscode.TextDocument) => {
      if (point) {
        vscode.window.showTextDocument(a, {
          selection: point
            ? new vscode.Range(
                new vscode.Position(point.line - 1, point.column - 1),
                new vscode.Position(point.line - 1, point.column - 1)
              )
            : undefined,
        });
      } else {
        vscode.window.showTextDocument(a);
      }
    },
    (error: any) => {
      //
    }
  );
}
