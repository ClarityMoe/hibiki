// Shard.ts - Shard class (noud02)

import * as Eris from "eris";
import * as path from "path";
import { ClientConfig } from "pg";
import * as WebSocket from "ws";
import { PostgreSQL } from "../db/PostgreSQL";
import { CommandHandler } from "../ext/CommandHandler";
import { ExtensionManager, IExtOptions } from "../ext/ExtensionManager";
import { LocaleManager } from "../locale/LocaleManager";
import { WebSocketClient } from "./WebSocketClient";

export interface IHibikiOptions {
    hibiki: {
        prefixes: string[];
        owners: string[];
    };
    eris: Eris.ClientOptions;
    ws: {
        host: string;
        port: number;
        ssl: boolean;
    };
    postgres: ClientConfig;
    ext: IExtOptions;
}

export class Shard extends Eris.Client {

    public pg: PostgreSQL = new PostgreSQL(this.hibikiOptions.postgres);
    public ws: WebSocketClient = new WebSocketClient(`${this.hibikiOptions.ws.ssl && "wss" || "ws"}://${this.hibikiOptions.ws.host}:${this.hibikiOptions.ws.port || 8080}`, {
        headers: {
            token: this.token,
        },
    });
    public ext: ExtensionManager = new ExtensionManager(this.hibikiOptions.ext);
    public ch: CommandHandler = new CommandHandler(this);
    public lm: LocaleManager = new LocaleManager();

    constructor (token: string, public hibikiOptions: IHibikiOptions) {
        super(token, hibikiOptions.eris);
    }

    public async connectShard (timeout?: number): Promise<void> {
        const connTimeout: any = setTimeout(() => {
            return Promise.reject(new Error("Connect timed out"));
        }, timeout || 10000);

        try {
            await this.lm.init();
            await this.connect();
            await this.pg.connect();
            // await this.ws.connect();
            await this.ext.init();
            await this.ch.init();
            clearTimeout(connTimeout);

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    public async disconnectShard (): Promise<void> {
        try {
            this.disconnect({ reconnect: false });
            // await this.ext.break();
            // await this.ws.disconnect();
            await this.pg.disconnect();

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }
}
