import vscode from "vscode";
import { OutlineContent } from "../types";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { sortRoot } from "../sort";
import { mdastToOutlineAstRoot } from "../transform";

export async function loadAndParse(uri: vscode.Uri): Promise<OutlineContent> {
  const document = await vscode.workspace.openTextDocument(uri);
  const mdast = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, "yaml")
    .parse(document.getText());
  return sortRoot(mdastToOutlineAstRoot(mdast)) as any;
}
