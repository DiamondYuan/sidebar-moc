import { OutlineRoot, OutlineContent } from "./types";
import {
  Content as MdastContent,
  Root as MdastRoot,
  Heading,
  List,
  ListItem,
} from "mdast";

export function transformMdastToMocAst(
  root: MdastContent | MdastRoot
): OutlineRoot | null | OutlineContent | OutlineContent[] {
  if (root.type === "root") {
    return {
      type: "root",
      children: transformChildren(root),
    };
  } else if (root.type === "list") {
    return transformChildren(root);
  } else if (root.type === "heading") {
    return {
      type: "heading",
      depth: root.depth,
      startPoint: getStartPoint(root.position),
      children: transformChildren(root) as any,
    };
  } else if (root.type === "listItem") {
    return {
      type: "treeNode",
      startPoint: getStartPoint(root.position),
      children: transformChildren(root) as any,
    };
  }
  return null;
}

function getStartPoint(position?: Heading["position"]) {
  if (!position) {
    return;
  }
  return {
    line: position.start.line,
    column: position.start.column,
  };
}

function transformChildren(
  root: Heading | List | MdastRoot | ListItem
): OutlineContent[] {
  let children: any[] = [];
  let originalChildren = root.children;
  if (originalChildren.length > 0) {
    for (const child of originalChildren) {
      const result = transformMdastToMocAst(child);
      if (Array.isArray(result)) {
        children = children.concat(result);
      } else if (!!result) {
        children.push(result);
      }
    }
  }
  return children;
}
