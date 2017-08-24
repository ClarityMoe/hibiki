// ExtensionManager.ts - Extension manager (noud02)

import * as path from "path";
import * as rreaddirSync from "recursive-readdir-sync";
import { Command } from "./Command";

export interface IExtOptions {
    extensionDir: string;
}

export class ExtensionManager {

    public commands: Map<string, Command> = new Map<string, Command>();

    constructor (private options: IExtOptions) {}

    public init (): Promise<void> {
        let files: string[] = [];

        try {
            files = rreaddirSync(path.resolve(this.options.extensionDir));
        } catch (e) {
            return Promise.reject(e);
        }

        for (const file of files) {
            if (!file.endsWith(".js")) {
                continue;
            }

            const Ext: new () => Command = require(file);

            this.commands.set(Ext.prototype.name, new Ext());

            delete require.cache[require.resolve(file)];
        }

        return Promise.resolve();
    }
}
