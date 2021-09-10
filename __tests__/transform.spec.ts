import { transformMdastToMocAst } from "../src/transform";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import path from "path";
import { FixtureManager } from "fixture-manager";
import { outlineToString } from "./helper";

const fixtures = new FixtureManager({ path: path.join(__dirname, "fixture") });

unified().use(remarkParse).use(remarkGfm).parse("");
it("", async () => {
  const gitbook = await fixtures.get("gitbook");
  const mdast = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse((await gitbook.readFile("summary.md"))!);
  gitbook.writeFile(
    "summary.md.outline.json",
    JSON.stringify(transformMdastToMocAst(mdast), null, 2)
  );
  gitbook.writeFile(
    "summary.md.outline",
    outlineToString(transformMdastToMocAst(mdast) as any)
  );
});
