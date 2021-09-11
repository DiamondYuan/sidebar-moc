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
exports.transformMdastToMocAst = void 0;
var unist_util_select_1 = require("unist-util-select");
var mdast_util_to_string_1 = require("mdast-util-to-string");
function transformMdastToMocAst(root) {
    if (root.type === "root") {
        return {
            type: "root",
            children: transformChildren(root),
        };
    }
    else if (root.type === "list") {
        return transformChildren(root);
    }
    else if (root.type === "heading") {
        return __assign({ type: "heading", depth: root.depth, startPoint: getStartPoint(root.position), children: transformChildren(root) }, getHeadingContent(root));
    }
    else if (root.type === "listItem") {
        return __assign({ type: "treeNode", startPoint: getStartPoint(root.position), children: transformChildren(root) }, getListItemContent(root));
    }
    return null;
}
exports.transformMdastToMocAst = transformMdastToMocAst;
function getStartPoint(position) {
    if (!position) {
        return;
    }
    return {
        line: position.start.line,
        column: position.start.column,
    };
}
function transformChildren(root) {
    var children = [];
    var originalChildren = root.children;
    if (originalChildren.length > 0) {
        for (var _i = 0, originalChildren_1 = originalChildren; _i < originalChildren_1.length; _i++) {
            var child = originalChildren_1[_i];
            var result = transformMdastToMocAst(child);
            if (Array.isArray(result)) {
                children = children.concat(result);
            }
            else if (!!result) {
                children.push(result);
            }
        }
    }
    return children;
}
function getListItemContent(listItem) {
    var firstChild = null;
    for (var _i = 0, _a = listItem.children; _i < _a.length; _i++) {
        var item = _a[_i];
        if (item.type === "list" || item.type === "heading") {
            return;
        }
        if (!firstChild) {
            firstChild = item;
        }
        var linkItem = (0, unist_util_select_1.select)("link", item);
        if (linkItem) {
            return {
                text: (0, mdast_util_to_string_1.toString)(linkItem),
                url: linkItem.url,
            };
        }
    }
    if (firstChild) {
        return {
            text: (0, mdast_util_to_string_1.toString)(firstChild),
        };
    }
    return;
}
function getHeadingContent(heading) {
    var linkItem = (0, unist_util_select_1.select)("link", heading);
    if (linkItem) {
        return {
            text: (0, mdast_util_to_string_1.toString)(linkItem),
            url: linkItem.url,
        };
    }
    return {
        text: (0, mdast_util_to_string_1.toString)(heading),
    };
}
