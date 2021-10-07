import { TOCCompletionItemProvider } from "./contrib/language/path-completion-item-provider";
import { TocService } from "./services/toc-service";
import { Point, OutlineDataWithUri } from "./types";
import vscode, { Uri } from "vscode";
import { TOCTreeDataProvider } from "./contrib/toc-tree-data-provider";
import { Utils, URI } from "vscode-uri";
import { PathService } from "./services/path";

function getConfigurationFile(): {
  target: vscode.ConfigurationTarget;
  fsPath?: string;
} {
  if (vscode.workspace.workspaceFile) {
    if (vscode.workspace.workspaceFile.scheme === "untitled") {
      return {
        target: vscode.ConfigurationTarget.Workspace,
      };
    }
    return {
      target: vscode.ConfigurationTarget.Workspace,
      fsPath: vscode.workspace.workspaceFile.fsPath,
    };
  }
  if (Array.isArray(vscode.workspace.workspaceFolders)) {
    const workspaceFolders: vscode.WorkspaceFolder[] =
      vscode.workspace.workspaceFolders;
    if (workspaceFolders.length !== 1) {
      throw new Error("un expect workspaceFolders");
    }
    return {
      target: vscode.ConfigurationTarget.WorkspaceFolder,
      fsPath: workspaceFolders[0].uri.fsPath,
    };
  }
  return {
    target: vscode.ConfigurationTarget.Global,
  };
}

export async function activate(context: vscode.ExtensionContext) {
  const configurationFile = getConfigurationFile();
  const pathService = new PathService(configurationFile.fsPath);
  function updateContext() {
    const config = vscode.workspace.getConfiguration();
    const mocPaths: string[] = config.get("sidebar-moc.mocPath") ?? [];
    const fsPath = vscode.window.activeTextEditor?.document?.uri.fsPath;
    if (!fsPath) {
      return;
    }
    console.log(
      "mocPaths",
      "inSideBarMoc",
      mocPaths,
      mocPaths.includes(pathService.uriToConfigPath(fsPath))
    );
    if (mocPaths.includes(pathService.uriToConfigPath(fsPath))) {
      vscode.commands.executeCommand("setContext", "inSideBarMoc", true);
    } else {
      vscode.commands.executeCommand("setContext", "inSideBarMoc", false);
    }
  }
  const tocService = new TocService(new PathService(configurationFile.fsPath));
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
    let paths: string[] = config.get("sidebar-moc.mocPath") ?? [];
    if (!paths.includes(pathService.uriToConfigPath(e.fsPath))) {
      paths.push(pathService.uriToConfigPath(e.fsPath));
    }
    config.update("sidebar-moc.mocPath", paths).then(() => {
      updateContext();
    });
  });
  vscode.commands.registerCommand("sidebar-moc.remove-moc", (e: Uri) => {
    const config = vscode.workspace.getConfiguration();
    let paths: string[] = config.get("sidebar-moc.mocPath") ?? [];
    if (paths.includes(pathService.uriToConfigPath(e.fsPath))) {
      paths = paths.filter((p) => p !== pathService.uriToConfigPath(e.fsPath));
    }
    config.update("sidebar-moc.mocPath", paths).then(() => {
      setTimeout(() => {
        updateContext();
      }, 100);
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
