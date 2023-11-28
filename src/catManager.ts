import { get } from "https";
import { ExtensionContext, Uri, workspace } from "vscode";


export default class CatManager {
    storage: Promise<Uri>;
    count = 0;
    private static instance: CatManager;
    private constructor(private context: ExtensionContext) {
        this.storage = this.load();
    }

    public static getInstance(context: ExtensionContext) {
        if (!this.instance) {
            this.instance = new CatManager(context);
        }
        return this.instance;
    }

    private load() {
        return new Promise<Uri>((resolve, reject) => {
            get("https://cataas.com/cat?type=square", result => {
                const data = [] as Buffer[];
                result.on("data", chunk => data.push(chunk));
                result.on("end", () => {
                    const uri = Uri.joinPath(this.context.extensionUri, "cats", `cat${this.count++}.${result.headers['content-type']?.replace("image/", "") || "jpg"}`);
                    workspace.fs.writeFile(uri, Buffer.concat(data));
                    resolve(uri);
                });
                result.on("error", e => reject(e));
            }).on("error", e => reject(e));
        });
    }

    get() {
        const res = this.storage;
        this.storage = this.load();
        return res;
    }
}