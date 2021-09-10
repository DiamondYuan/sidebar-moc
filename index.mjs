import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import fs from 'fs'
import { toString } from 'mdast-util-to-string'
import { visit, SKIP } from 'unist-util-visit'


const summary = fs.readFileSync('summary.md', 'utf-8')
const tree = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .parse(summary);


const result = {
  type: 'root', children: [], data: [],
};
const keyPath = []

visit(tree, ['heading', 'list'], (node) => {
  if (node.type === 'heading') {
    let container = getContainer(result, keyPath).children;
    if (container.length > 0) {
      const last = container[container.length - 1];
      if (last.depth < node.depth) {
        keyPath.push(container.length - 1)
      } else if (last.depth > node.depth) {
        keyPath.pop()
      }
    }
    getContainer(result, keyPath).children.push({
      type: 'heading',
      depth: node.depth,
      title: toString(node),
      data: [],
      children: []
    })
  } else if (node.type === 'list') {
    return SKIP
  }
})

function getContainer(input, keyPath) {
  let result = input;
  for (const iterator of keyPath) {
    result = result.children[iterator]
  }
  return result;
}







console.log('result', JSON.stringify(result, null, 2));
