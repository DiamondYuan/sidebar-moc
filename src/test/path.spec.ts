import { PathService } from "../services/path";
import { URI } from "vscode-uri";

describe("test", () => {
  it("uriToConfigPath", () => {
    const service = new PathService("/a/b");
    expect(service.uriToConfigPath("/a/b/moc.md")).toEqual("moc.md");

    expect(service.uriToConfigPath("/a/moc.md")).toEqual("../moc.md");
  });

  it("configPathToUri", () => {
    const service = new PathService("/a/b");
    expect(service.configPathToUri("/a.md")).toEqual("/a.md");
  });
});
