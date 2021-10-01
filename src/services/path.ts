import vscode from "vscode";

export interface IPathService {
  uriToConfigPath(fs: vscode.Uri): string;
  ConfigPathToUri(configPath: string): vscode.Uri;
}
