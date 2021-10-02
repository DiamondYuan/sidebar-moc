import vscode from "vscode";

export interface IPathService {
  uriToConfigPath(fs: vscode.Uri): string;
  configPathToUri(configPath: string): vscode.Uri;
}

export class PathService implements IPathService {
  constructor(private base: vscode.Uri) {}
  uriToConfigPath(fs: vscode.Uri) {
    return "";
  }

  configPathToUri(configPath: string): vscode.Uri {
    return vscode.Uri.joinPath(this.base, configPath);
  }
}
