import { OutlineRoot, OutlineContent, OutlineHeadingNode } from "./types";

export function sortRoot(root: OutlineRoot): OutlineRoot {
  return { type: "root", children: sortChildren(root.children) };
}

function sortChildren(nodes: OutlineContent[]): OutlineContent[] {
  const result: OutlineContent[] = [];
  let paths: number[] = [];
  for (const node of nodes) {
    let parentChildren = getParentChildren(result, paths);
    if (node.type === "treeNode") {
      parentChildren.children.push({
        ...node,
        children: sortChildren(node.children),
      });
    } else {
      while (
        parentChildren.parent !== null &&
        parentChildren.parent.depth >= node.depth
      ) {
        paths.pop();
        parentChildren = getParentChildren(result, paths);
      }
      parentChildren.children.push(node);
      paths.push(parentChildren.children.length - 1);
    }
  }
  return result;
}

function getParentChildren(
  root: OutlineContent[],
  path: number[]
): { children: OutlineContent[]; parent: OutlineHeadingNode | null } {
  let parent: OutlineHeadingNode | null = null;
  let children = root;
  if (path.length === 0) {
    return {
      children,
      parent,
    };
  }
  for (let item of path) {
    parent = children[item] as OutlineHeadingNode;
    children = parent.children;
  }
  return {
    children,
    parent,
  };
}
