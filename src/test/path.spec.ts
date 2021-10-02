import { PathService } from "../services/path";
import { URI } from "vscode-uri";

describe("test", () => {
  it("uriToConfigPath", () => {
    const service = new PathService(URI.file("/a/b"));
    expect(service.uriToConfigPath(URI.file("/a/b/moc.md"))).toEqual("moc.md");

    expect(service.uriToConfigPath(URI.file("/a/moc.md"))).toEqual("../moc.md");
  });

  it("configPathToUri", () => {
    const service = new PathService(URI.file("/a/b"));
    expect(service.configPathToUri("/a.md").fsPath).toEqual("/a.md");
  });
});
