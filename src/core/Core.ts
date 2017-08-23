// Core.ts - Core of the bot (noud02)

import { EventEmitter } from "events";
import * as sanic from "sanic";
import { Shard } from "../client/Shard";
import { Postgres } from "../db/Postgres";
import { Redis } from "../db/Redis";
import { ExtManager } from "./ExtManager";

/**
 * Core of the bot
 *
 */
export class Core extends EventEmitter {

    /**
     * Creates an instance of Core.
     * @param {Shard} shard
     */
    constructor (private shard: Shard) {
        super();
    }

    /**
     * Extension manager class
     *
     */
    public ext: ExtManager = new ExtManager(this.shard);

    /**
     * Postgres wrapper class
     *
     */
    public pg: Postgres = new Postgres(this.shard, this.shard.options.db.postgres);

    /**
     * Redis wrapper class
     *
     */
    public r: Redis = new Redis(this.shard.options.db.redis);

    /**
     * Connect all modules
     *
     * @param {number} timeout
     * @returns {Promise<void>}
     */
    public connect (timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const this_: this = this;
            const conTimeout: any = setTimeout(() => reject(new Error("Connect timed out")), timeout);
            sanic(function* () {
                yield this_.pg.connect();
                yield this_.r.connect();
                yield this_.ext.init();
            })()
                .then(() => {
                    clearTimeout(conTimeout);
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Disconnect all modules
     *
     * @returns {Promise<void>}
     */
    public disconnect (): Promise<void> {
        return new Promise((resolve, reject) => {
            const this_: this = this;
            sanic(function* () {
                yield this_.ext.break();
                // yield this_.shard.ws.disconnect();
                yield this_.r.disconnect();
                yield this_.pg.disconnect();
            })()
                .then(resolve)
                .catch(reject);
        });
    }
}
