// Shard.ts - Shard class (noud02)

import { Client, ClientOptions } from "eris";
import { EventEmitter } from "events";
import * as pg from "pg";
import * as sanic from "sanic";
import { OPCodes } from "../Constants";
import { IHibikiConfig } from "../Constants";
import { Core } from "../core/Core";
import { Connection } from "./Connection";
import { Logger } from "./Logger";

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
    constructor (public id: number, public token: string, public options: IHibikiConfig) {
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
    public readonly ws: Connection = new Connection(this);

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
            yield this_.ws.connect();
            yield this_.client.connect();
            if (this_.core) {
                yield this_.core.connect(10000);
            }
        })();
    }

    public disconnect (): Promise<void> {
        const this_: this = this;

        return sanic(function* () {
            if (this_.core) {
                yield this_.unloadCore();
            }
            yield this_.client.disconnect({ reconnect: false });
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
        const C = require("../core/Core").Core;
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

                    this_.logger.ok("Unloaded core");

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

                const C = require("../core/Core").Core;
                const core: Core = new C(this_);
                this_.core = core;

                return resolve(core);
            })()
                .catch(reject);
        });
    }
}
