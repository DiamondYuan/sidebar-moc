import { mdastToOutlineAstRoot } from "../transform";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import path from "path";
import { FixtureManager } from "fixture-manager";
import { outlineToString } from "./helper";
import { sortRoot } from "../sort";
import remarkFrontmatter from "remark-frontmatter";

const fixtures = new FixtureManager({ path: path.join(__dirname, "fixture") });

it("", async () => {
  const gitbook = await fixtures.get("gitbook");
  const mdast = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse((await gitbook.readFile("summary.md"))!);
  gitbook.writeFile(
    "summary.md.outline.json",
    JSON.stringify(mdastToOutlineAstRoot(mdast), null, 2)
  );
  expect(await outlineToString(sortRoot(mdastToOutlineAstRoot(mdast) as any)))
    .toMatchInlineSnapshot(`
"[root]
  [heading-1]  Summary
      [heading-3]  Part I  (part1/README.md)
          [treeNode]  Part I  (part1/README.md)
              [treeNode]  Writing is nice  (part1/README.md#writing)
              [treeNode]  undefined
                  [heading-2]  Header In ListItem
                      [treeNode]  ListItem Without Link
                      [treeNode]  
              [treeNode]  GitBook is nice  (part1/READMwE.md#gitbook)
                  [treeNode]  GitBook is nice  (part1/README.md#gitbook)
  [heading-1]  Part II
      [treeNode]  Part II  (part2/README.md)"
`);
});

it("", async () => {
  const gitbook = await fixtures.get("frontmatter");
  const mdast = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, "yaml")
    .parse((await gitbook.readFile("summary.md"))!);
  gitbook.writeFile(
    "summary.md.outline.json",
    JSON.stringify(mdastToOutlineAstRoot(mdast), null, 2)
  );
  expect(await outlineToString(sortRoot(mdastToOutlineAstRoot(mdast) as any)))
    .toMatchInlineSnapshot(`
"[root]
  [treeNode]  1.0  (1.0)
      [treeNode]  1.1  (1.1)
          [treeNode]  1.1.1  (1.1.1)
      [treeNode]  1.2  (1.2)"
`);
});
