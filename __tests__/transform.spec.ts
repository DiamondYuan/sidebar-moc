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
  expect(transformMdastToMocAst(mdast)).toMatchSnapshot();
});
