// Shard.ts - Shard class (noud02)

import { Client, ClientOptions } from "eris";
import { EventEmitter } from "events";
import * as pg from "pg";
import * as redis from "redis";
import * as sanic from "sanic";
import { Core } from "../core/Core";
import { SockConnection } from "./Connection";
import { Logger } from "./Logger";

/**
 * Shard options
 *
 * @interface IShardOptions
 */
export interface IShardOptions {
    db: {
        postgres: pg.ClientConfig,
        redis: redis.ClientOpts,
    };
    shards: Array<{ id: number, server: { host: string } }>;
    logger: { debug: boolean };
    disabledEvents: string[];
    useENV: boolean;
}

/**
 * Shard class
 *
 */
export class Shard extends EventEmitter {

    /**
     * Logger class
     *
     * @private
     */
    private readonly logger: Logger = new Logger(this);

    /**
     * Eris options
     *
     * @private
     */
    private erisOptions: ClientOptions;

    /**
     * Core
     *
     */
    public core: Core | null;

    /**
     * Creates an instance of Shard.
     * @param {string} token
     * @param {IShardOptions} options
     */
    constructor (private token: string, public options: IShardOptions) {
        super();
        this.loadCore()
            .then(() => {
                return this.logger.ok("Core loaded");
            })
            .catch((e) => {
                return this.logger.fail("Error while loading core:\n", e.stack);
            });
    }

    /**
     * Eris client
     *
     */
    public readonly client: Client = new Client(this.token, this.erisOptions);

    /**
     * WebSocket connection
     *
     */
    public readonly ws: SockConnection = new SockConnection(this);

    /**
     * Shard ID
     *
     */
    public readonly id: number = this.options.useENV && Number(process.env.SHARD_ID) || 1;

    /**
     * Connects the shard and core
     *
     * @returns {Promise<void>}
     */
    public connect (): Promise<void> {
        if (!this.core) {
            return Promise.reject(new Error("Core is not loaded"));
        }
        const this_: this = this;

        return sanic(function* () {
            yield this_.client.connect();
            if (this_.core) {
                yield this_.core.connect(10000);
            }
        })();
    }

    /**
     * Loads the core (if not loaded)
     *
     * @returns {Promise<Core>}
     */
    public loadCore (): Promise<Core> {
        if (this.core) {
            return Promise.reject(new Error("Core is already loaded"));
        }
        const C = require("../core/Core");
        const core: Core = new C(this);
        this.core = core;

        return Promise.resolve(core);
    }

    /**
     * Unloads the core (if loaded)
     *
     * @returns {Promise<Core>}
     */
    public unloadCore (): Promise<Core> {
        return new Promise((resolve, reject) => {
            if (!this.core) {
                return reject(new Error("Core is not loaded"));
            }
            const this_: this = this;
            sanic(function* () {
                if (this_.core) { // IK this isn't needed but typememe isn't as smart as I thought
                    const core: Core = this_.core;
                    yield this_.core.disconnect();
                    this_.core = null;

                    return resolve(core);
                }
            })()
                .catch(reject);
        });
    }

    /**
     * Reloads the core
     *
     * @returns {Promise<Core>}
     */
    public reloadCore (): Promise<Core> {
        return new Promise((resolve, reject) => {
            const this_: this = this;
            sanic(function* () {
                if (this_.core) {
                    yield this_.core.disconnect();
                }

                const C = require("../core/Core");
                const core: Core = new C(this_);
                this_.core = core;

                return resolve(core);
            })()
                .catch(reject);
        });
    }
}
