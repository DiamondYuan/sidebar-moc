import { TocService } from "./services/toc-service";
import { OutlineContent, Point } from "./types";
import vscode, { Uri } from "vscode";

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
    private tocService: TocService
  ) {}

  private _onDidChangeTreeData: vscode.EventEmitter<undefined | void> =
    new vscode.EventEmitter<undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<undefined | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
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
      return this.tocService.toc as any;
    }
    return element.children;
  }
}

function updateContext() {
  const config = vscode.workspace.getConfiguration();
  const mocPaths: string[] = config.get("sidebar-moc.mocPath") ?? [];
  const fsPath = vscode.window.activeTextEditor?.document?.uri.fsPath;
  if (!fsPath) {
    return;
  }
  if (mocPaths.includes(fsPath)) {
    vscode.commands.executeCommand("setContext", "inSideBarMoc", true);
  } else {
    vscode.commands.executeCommand("setContext", "inSideBarMoc", false);
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const tocService = new TocService();
  const treeDataProvider = new DataProvider(context, tocService);
  tocService.onTocChange(() => {
    treeDataProvider.refresh();
  });
  vscode.window.createTreeView("sidebar-moc.view", {
    treeDataProvider: treeDataProvider,
  });
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.md");
  watcher.onDidChange((e) => {
    tocService.updateToc(e);
  });
  vscode.commands.registerCommand(
    "sidebar-moc.open-uri",
    (file: { url: string; point: Point }) => {
      // if (!mocPath) {
      //   return;
      // }
      // const mocURI = vscode.Uri.file(mocPath);
      // if (!file.url) {
      //   openAndShow(mocURI, file.point);
      //   return;
      // }
      // if (file.url.startsWith("http")) {
      //   vscode.env.openExternal(vscode.Uri.parse(file.url));
      // }
      // const fileUrI = vscode.Uri.joinPath(Utils.dirname(mocURI), file.url);
      // openAndShow(fileUrI);
    }
  );

  vscode.window.onDidChangeActiveTextEditor((e) => {
    updateContext();
  });

  vscode.workspace.onDidChangeConfiguration(() => {
    const config = vscode.workspace.getConfiguration();
    let paths: string[] = config.get("sidebar-moc.mocPath") ?? [];
    tocService.updateConfig(paths);
  });

  vscode.commands.registerCommand("sidebar-moc.add-moc", (e: Uri) => {
    const config = vscode.workspace.getConfiguration();
    const paths: string[] = config.get("sidebar-moc.mocPath") ?? [];
    if (!paths.includes(e.fsPath)) {
      paths.push(e.fsPath);
    }
    config.update("sidebar-moc.mocPath", paths).then(() => {
      updateContext();
    });
  });
  vscode.commands.registerCommand("sidebar-moc.remove-moc", (e: Uri) => {
    const config = vscode.workspace.getConfiguration();
    let paths: string[] = config.get("sidebar-moc.mocPath") ?? [];
    if (paths.includes(e.fsPath)) {
      paths = paths.filter((o) => o !== e.fsPath);
    }
    config.update("sidebar-moc.mocPath", paths).then(() => {
      updateContext();
    });
  });
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
