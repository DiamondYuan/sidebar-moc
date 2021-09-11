"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortRoot = void 0;
function sortRoot(root) {
    return { type: "root", children: sortChildren(root.children) };
}
exports.sortRoot = sortRoot;
function sortChildren(nodes) {
    var result = [];
    var paths = [];
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        var parentChildren = getParentChildren(result, paths);
        if (node.type === "treeNode") {
            parentChildren.children.push(__assign(__assign({}, node), { children: sortChildren(node.children) }));
        }
        else {
            while (parentChildren.parent !== null &&
                parentChildren.parent.depth >= node.depth) {
                paths.pop();
                parentChildren = getParentChildren(result, paths);
            }
            parentChildren.children.push(node);
            paths.push(parentChildren.children.length - 1);
        }
    }
    return result;
}
function getParentChildren(root, path) {
    var parent = null;
    var children = root;
    if (path.length === 0) {
        return {
            children: children,
            parent: parent,
        };
    }
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var item = path_1[_i];
        parent = children[item];
        children = parent.children;
    }
    return {
        children: children,
        parent: parent,
    };
}
