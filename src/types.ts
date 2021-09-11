import vscode from "vscode";

export interface Point {
  line: number;
  column: number;
}

export type OutlineContent = OutlineHeadingNode | OutlineTreeNode;

export interface OutlineHeadingNode {
  type: "heading";
  startPoint?: Point;
  depth: number;
  text?: string;
  url?: string;
  children: Array<OutlineContent>;
}

export interface OutlineTreeNode {
  type: "treeNode";
  startPoint?: Point;
  text?: string;
  url?: string;
  children: Array<OutlineContent>;
}

export interface OutlineRoot {
  type: "root";
  children: Array<OutlineContent>;
}

export interface OutlineDataWithUri {
  uri: vscode.Uri;
  data: OutlineRoot | OutlineContent;
}
