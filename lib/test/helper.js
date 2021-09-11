"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outlineToString = void 0;
function outlineToString(root, prefix) {
    if (prefix === void 0) { prefix = ""; }
    var result = ["" + prefix + getHeader(root)].concat(root.children.map(function (p) { return "" + prefix + outlineToString(p, prefix + "  "); }));
    return result.join("\n");
}
exports.outlineToString = outlineToString;
function getHeader(root) {
    if (root.type === "root") {
        return "[" + root.type + "]";
    }
    else if (root.type === "heading") {
        return "[" + root.type + "-" + root.depth + "]  " + root.text + (root.url ? "  (" + root.url + ")" : "");
    }
    return "[" + root.type + "]  " + root.text + (root.url ? "  (" + root.url + ")" : "");
}
