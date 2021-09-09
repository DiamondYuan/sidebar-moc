import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import fs from 'fs'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

const summary = fs.readFileSync('summary.md', 'utf-8')
const tree = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .parse(summary);


const result = []
const keyPath = []
visit(tree, ['heading', 'list'], (node) => {
  if (node.type === 'heading') {
    let container = getContainer(result, keyPath);
    if (container.length > 0) {
      const last = container[container.length - 1];
      if (last.depth < node.depth) {
        keyPath.push(container.length - 1)
      } else if (last.depth > node.depth) {
        keyPath.pop()
      }
    }
    getContainer(result, keyPath).push({
      depth: node.depth,
      title: toString(node),
      children: []
    })
  }
})

function getContainer(input, keyPath) {
  let result = input
  for (const iterator of keyPath) {
    result = result[iterator].children;
  }
  return result;
}

console.log('result', JSON.stringify(result, null, 2));