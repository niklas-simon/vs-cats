import { get } from "https";
import { ExtensionContext, Uri, workspace } from "vscode";
import Jimp = require("jimp");
import path = require("path");

interface Cat {
    id: string,
    url: string,
    width: number,
    height: number
}

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

    private request(url: string): Promise<{data: Buffer, type?: string}> {
        return new Promise<{data: Buffer, type?: string}>((resolve, reject) => {
            get(url, result => {
                const data = [] as Buffer[];
                result.on("data", chunk => data.push(chunk));
                result.on("end", () => {
                    resolve({
                        data: Buffer.concat(data),
                        type: result.headers['content-type']
                    });
                });
                result.on("error", e => reject(e));
            }).on("error", e => reject(e));
        });
    }

    private async load() {
        const jsonStr = await this.request("https://api.thecatapi.com/v1/images/search");
        const cat = (JSON.parse(jsonStr.data.toString()) as Cat[])[0];
        const res = await this.request(cat.url);
        const folder = Uri.joinPath(this.context.extensionUri, "cats");
        await workspace.fs.createDirectory(folder);
        const uri = Uri.joinPath(folder, `cat${this.count++}.${res.type?.replace("image/", "") || "jpg"}`);
        (await Jimp.read(res.data))
            .resize(
                cat.height > cat.width ? Math.round(cat.width * 300 / cat.height) : 300,
                cat.width > cat.height ? Math.round(cat.height * 300 / cat.width) : 300
            ).write(uri.fsPath);
        return uri;
    }

    get() {
        const res = this.storage;
        this.storage = this.load();
        return res;
    }
}