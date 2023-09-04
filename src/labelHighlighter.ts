import { DecorationRangeBehavior, ExtensionContext, Position, Range, window, workspace } from "vscode";

export default class LabelHighlighter {
    private static instance: LabelHighlighter;
    private catDecoration = window.createTextEditorDecorationType({
        before: {
            contentText: "🐱"
        },
        rangeBehavior: DecorationRangeBehavior.ClosedClosed
    });

    private highlight() {
        const editor = window.activeTextEditor;
        if (!editor) {
            return;
        }
        const ranges = editor.visibleRanges.reduce<Range[]>((arr, range) => {
            let lines;
            if (range.isSingleLine) {
                lines = [range];
            } else {
                lines = Array.from(Array(range.end.line - range.start.line)).map((v, i) => editor.document.lineAt(range.start.line + i).range);
            }
            return arr.concat(lines.reduce<Range[]>((a, l) => {
                const match = Array.from(editor.document.getText(l).matchAll(/\w+/g));
                return a.concat(match.map(m => new Range(new Position(l.start.line, m.index!), new Position(l.start.line, m.index! + m[0].length))));
            }, []));
        }, []);
        editor.setDecorations(this.catDecoration, ranges.filter(r => editor.document.getText(r).match(/cat/i)));
    }

    private constructor() {
        window.onDidChangeTextEditorVisibleRanges(() => this.highlight());
        window.onDidChangeActiveTextEditor(e => e && this.highlight());
        workspace.onDidChangeTextDocument(e => e.document === window.activeTextEditor?.document && this.highlight());
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new LabelHighlighter();
        }
        return this.instance;
    }
}