import { URI, Utils } from "vscode-uri";
import { relative } from "path";

export interface IPathService {
  uriToConfigPath(fs: URI): string;
  configPathToUri(configPath: string): URI;
}

export class PathService implements IPathService {
  constructor(private base: URI) {}

  uriToConfigPath(uri: URI) {
    // TODO: remove path
    return relative(this.base.fsPath, uri.fsPath);
  }

  configPathToUri(configPath: string): URI {
    if (configPath.startsWith("/")) {
      return URI.file(configPath);
    }
    return Utils.joinPath(this.base, configPath);
  }
}
