// Shard.ts - Shard class (noud02)

import * as blocked from "blocked";
import * as Eris from "eris";
import * as path from "path";
import { ClientConfig } from "pg";
import * as WebSocket from "ws";
import { PostgreSQL } from "../db/PostgreSQL";
import { CommandHandler } from "../ext/CommandHandler";
import { ExtensionManager, IExtOptions } from "../ext/ExtensionManager";
import { LocaleManager } from "../locale/LocaleManager";
import { Logger } from "./Logger";
import { WebSocketClient } from "./WebSocketClient";

/**
 * Options
 *
 * @export
 * @interface IHibikiOptions
 */
export interface IHibikiOptions {
    hibiki: {
        prefixes: string[];
        owners: string[];
        debug: boolean;
    };
    eris?: Eris.ClientOptions;
    ws: {
        host: string;
        port?: number;
        ssl?: boolean;
    };
    postgres: ClientConfig;
    ext: IExtOptions;
}

/**
 * Main Shard/Client class
 * @see https://abal.moe/Eris/docs/Client
 *
 * @param {string} token Token to use
 * @param {IHibikiOptions} hibikiOptions Options
 * @export
 * @class Shard
 * @extends {Eris.Client}
 */
export class Shard extends Eris.Client {

    /**
     * PostgreSQL client
     *
     * @type {PostgreSQL}
     */
    public pg: PostgreSQL = new PostgreSQL(this.hibikiOptions.postgres);
    /**
     * WebSocket client
     *
     * @type {WebSocketClient}
     */
    public ws: WebSocketClient = new WebSocketClient(`${this.hibikiOptions.ws.ssl && "wss" || "ws"}://${this.hibikiOptions.ws.host}:${this.hibikiOptions.ws.port || 8080}`, {
        headers: {
            token: this.token,
        },
    });
    /**
     * Extension manager
     *
     * @type {ExtensionManager}
     */
    public ext: ExtensionManager = new ExtensionManager(this.hibikiOptions.ext);
    /**
     * Command handler
     *
     * @type {CommandHandler}
     */
    public ch: CommandHandler = new CommandHandler(this);
    /**
     * Locale manager
     *
     * @type {LocaleManager}
     */
    public lm: LocaleManager = new LocaleManager();
    /**
     * Event loop block detector
     *
     * @type {NodeJS.Timer}
     */
    /**
     * Emitted when the event loop is blocked
     *
     * @memberof Shard
     * @event blocked
     */
    public blocked: NodeJS.Timer = blocked((ms: number) => this.emit("blocked", ms));

    /**
     * Logger that logs things
     *
     * @type {Logger}
     */
    public logger: Logger = new Logger("shard", this.hibikiOptions.hibiki.debug);

    constructor (token: string, public hibikiOptions: IHibikiOptions) {
        super(token, hibikiOptions.eris || {});
    }

    /**
     * Initializes the framework
     *
     * @param {number} [timeout] Timeout in ms
     * @returns {Promise<void>}
     */
    public async init (timeout?: number): Promise<void> {
        const connTimeout: any = setTimeout(() => {
            return Promise.reject(new Error("Connect timed out"));
        }, timeout || 10000);

        await this.lm.init();
        await this.pg.connect();
        await this.checkGuilds();
        // await this.ws.connect();
        await this.ext.init();
        await this.ch.init();

        this.on("guildCreate", (guild: Eris.Guild) => this.pg.addGuild(guild));

        clearTimeout(connTimeout);

        return Promise.resolve();
    }

    /**
     * Disconnects the shard
     *
     * @returns {Promise<void>}
     */
    public async disconnectShard (): Promise<void> {
        this.disconnect({ reconnect: false });
        // await this.ext.break();
        // await this.ws.disconnect();
        await this.pg.disconnect();

        return Promise.resolve();
    }

    /**
     * Checks if all guilds are in the database
     *
     * @returns {Promise<void>}
     */
    public async checkGuilds (): Promise<void> {
        for (const guild of this.guilds.map((g: Eris.Guild) => g)) {
            await this.pg.addGuild(guild);
        }

        return Promise.resolve();
    }
}
