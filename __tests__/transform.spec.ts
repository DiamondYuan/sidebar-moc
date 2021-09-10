import { transformMdastToMocAst } from "../src/transform";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import path from "path";
import fs from "fs";

unified().use(remarkParse).use(remarkGfm).parse("");

const summary = path.join(__dirname, "fixture", "summary.md");
const summaryContent = fs.readFileSync(summary, "utf-8");

it("", () => {
  const mdast = unified().use(remarkParse).use(remarkGfm).parse(summaryContent);
  expect(transformMdastToMocAst(mdast)).toEqual({
    type: "root",
    children: [
      {
        type: "heading",
        depth: 1,
        startPoint: { line: 1, column: 1 },
        children: [],
      },
      {
        type: "heading",
        depth: 3,
        startPoint: { line: 3, column: 1 },
        children: [],
      },
      {
        type: "treeNode",
        startPoint: { line: 5, column: 1 },
        children: [
          {
            type: "treeNode",
            startPoint: { line: 6, column: 3 },
            children: [],
          },
          {
            type: "treeNode",
            startPoint: { line: 7, column: 3 },
            children: [
              {
                type: "treeNode",
                startPoint: { line: 8, column: 5 },
                children: [],
              },
            ],
          },
        ],
      },
    ],
  });
});
