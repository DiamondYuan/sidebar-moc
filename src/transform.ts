import { OutlineRoot, OutlineContent } from "./types";
import {
  Content as MdastContent,
  Root as MdastRoot,
  Heading,
  List,
  ListItem,
  Link,
} from "mdast";
import { select } from "unist-util-select";
import { toString as mdastToString } from "mdast-util-to-string";
import { load } from "js-yaml";

export function mdastToOutlineAstRoot(origin: MdastRoot): OutlineRoot {
  if (origin.type !== "root") {
    throw new Error("");
  }
  let config: { title?: string } = {};
  for (const iterator of origin.children) {
    if (iterator.type === "yaml") {
      try {
        config = load(iterator.value) as { title?: string };
      } catch (error) {}
      break;
    }
  }
  return {
    type: "root",
    config,
    children: transformChildren(origin),
  };
}

export function transformMdastToMocAst(
  root: MdastContent | MdastRoot
): OutlineRoot | null | OutlineContent | OutlineContent[] {
  if (root.type === "root") {
    let config: { title?: string } = {};
    for (const iterator of root.children) {
      if (iterator.type === "yaml") {
        try {
          config = load(iterator.value) as { title?: string };
        } catch (error) {}
        break;
      }
    }
    return {
      type: "root",
      config,
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
      ...getHeadingContent(root),
    };
  } else if (root.type === "listItem") {
    return {
      type: "treeNode",
      startPoint: getStartPoint(root.position),
      children: transformChildren(root) as any,
      ...getListItemContent(root),
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

function getListItemContent(
  listItem: ListItem
): undefined | { text?: string; url?: string } {
  let firstChild = null;
  for (const item of listItem.children) {
    if (item.type === "list" || item.type === "heading") {
      return;
    }
    if (!firstChild) {
      firstChild = item;
    }
    const linkItem: Link | null = select("link", item) as Link;
    if (linkItem) {
      return {
        text: mdastToString(linkItem),
        url: linkItem.url,
      };
    }
  }
  if (firstChild) {
    return {
      text: mdastToString(firstChild),
    };
  }
  return;
}

function getHeadingContent(
  heading: Heading
): undefined | { text?: string; url?: string } {
  const linkItem: Link | null = select("link", heading) as Link;
  if (linkItem) {
    return {
      text: mdastToString(linkItem),
      url: linkItem.url,
    };
  }
  return {
    text: mdastToString(heading),
  };
}
