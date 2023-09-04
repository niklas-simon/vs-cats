import * as vscode from 'vscode';
import CatManager from './catManager';
import path = require('path');

export default class HoverProvider implements vscode.HoverProvider {
    private static instance: vscode.HoverProvider;
    private constructor(private context: vscode.ExtensionContext) {}

    public static getInstance(context: vscode.ExtensionContext) {
        if (!this.instance) {
            this.instance = new HoverProvider(context);
        }
        return this.instance;
    }

    async provideHover(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Hover | undefined> {
        const res = [] as (string | vscode.MarkdownString)[];
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return;
        }
        const text = document.getText(range);
        if (text.match(/cat/i)) {
            const cat = await CatManager.getInstance(this.context).get();
            const md = new vscode.MarkdownString(`![Cat](./cats/${path.basename(cat.path)})`);
            md.baseUri = vscode.Uri.file(this.context.extensionPath + "/");
            res.push(md);
        }
        return {
            contents: res
        };
    }
}