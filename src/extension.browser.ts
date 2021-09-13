import { TOCCompletionItemProvider } from "./contrib/language/path-completion-item-provider";
import { TocService } from "./services/toc-service";
import { Point, OutlineDataWithUri } from "./types";
import vscode, { Uri } from "vscode";
import { TOCTreeDataProvider } from "./contrib/toc-tree-data-provider";
import { Utils } from "vscode-uri";

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
  const treeDataProvider = new TOCTreeDataProvider(tocService);
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
  var selector: vscode.DocumentSelector = [
    {
      pattern: "**",
    },
  ];
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      new TOCCompletionItemProvider(tocService),
      "/"
    )
  );
  vscode.commands.registerCommand(
    "sidebar-moc.open-uri",
    (file: { uri: string; outlineData: OutlineDataWithUri["data"] }) => {
      const mocUri = Uri.file(file.uri);
      if (file.outlineData.type === "root") {
        openAndShow(mocUri, { line: 1, column: 1 });
        return;
      }
      if (!file.outlineData.url) {
        openAndShow(mocUri, file.outlineData.startPoint);
        return;
      }
      if (file.outlineData.url.startsWith("http")) {
        vscode.env.openExternal(vscode.Uri.parse(file.outlineData.url));
        return;
      }
      const fileUrI = vscode.Uri.joinPath(
        Utils.dirname(mocUri),
        file.outlineData.url
      );
      openAndShow(fileUrI);
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
