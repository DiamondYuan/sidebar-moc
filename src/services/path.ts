import { relative, resolve } from "path";

export interface IPathService {
  uriToConfigPath(fs: string): string;
  configPathToUri(configPath: string): string;
}

export class PathService implements IPathService {
  constructor(private base?: string) {}

  uriToConfigPath(uri: string) {
    if (!this.base) {
      return uri;
    }
    // TODO: remove path
    return relative(this.base, uri);
  }

  configPathToUri(configPath: string): string {
    if (configPath.startsWith("/")) {
      return configPath;
    }
    return resolve(this.base ?? "/", configPath);
  }
}
