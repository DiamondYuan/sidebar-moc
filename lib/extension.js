"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
var vscode_1 = __importDefault(require("vscode"));
var TreeViewItem = /** @class */ (function (_super) {
    __extends(TreeViewItem, _super);
    function TreeViewItem(data) {
        return _super.call(this, data.title) || this;
    }
    return TreeViewItem;
}(vscode_1.default.TreeItem));
var DataProvider = /** @class */ (function () {
    function DataProvider() {
    }
    DataProvider.prototype.getTreeItem = function (element) {
        return element;
    };
    DataProvider.prototype.getChildren = function (element) {
        return [];
    };
    return DataProvider;
}());
function activate(context) {
    vscode_1.default.window.createTreeView("sidebar-moc.view", {
        treeDataProvider: new DataProvider(),
    });
    var channel = vscode_1.default.window.createOutputChannel("Sidebar MOC");
    channel.appendLine("Hello World");
}
exports.activate = activate;
