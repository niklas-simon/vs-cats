// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import HoverProvider from './hoverProvider';
import LabelHighlighter from './labelHighlighter';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.languages.registerHoverProvider({pattern: "**/*"}, HoverProvider.getInstance(context));
    LabelHighlighter.getInstance();
}

// This method is called when your extension is deactivated
export function deactivate() {}
