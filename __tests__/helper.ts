import { OutlineRoot, OutlineContent } from "./../src/types";

export function outlineToString(
  root: OutlineRoot | OutlineContent,
  prefix: string = ""
): string {
  const result = [`${prefix}${getHeader(root)}`].concat(
    root.children.map((p) => `${prefix}${outlineToString(p, `${prefix}  `)}`)
  );
  return result.join("\n");
}

function getHeader(root: OutlineRoot | OutlineContent) {
  if (root.type === "root") {
    return `[${root.type}]`;
  } else if (root.type === "heading") {
    return `[${root.type}-${root.depth}] ${root.text}`;
  }
  return `[${root.type}] ${root.text}`;
}
