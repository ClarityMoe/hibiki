// Shard.ts - Shard class (noud02)

import { Client, ClientOptions } from "eris";
import { EventEmitter } from "events";
import * as sanic from "sanic";
import { Core } from "../core/Core";
import { IExtManagerOptions } from "../core/ExtManager";
import { IPostgresOptions } from "../db/Postgres";
import { IRedisOptions } from "../db/Redis";
import { SockConnection } from "./Connection";
import { Logger } from "./Logger";

export interface IShardOptions {
    database: {
        postgres: IPostgresOptions,
        redis: IRedisOptions,
    };
    shards: Array<{ id: number, server: { host: string } }>;
    logger: { debug: boolean };
    disabledEvents: string[];
    ext: IExtManagerOptions;
}

export class Shard extends EventEmitter {

    private readonly logger: Logger = new Logger(this);
    private erisOptions: ClientOptions;

    public core: Core | null;

    constructor (private token: string, public options: IShardOptions) {
        super();
        this.loadCore()
            .then(() => {
                return this.logger.ok("Core loaded");
            })
            .catch((e) => {
                return this.logger.err("Error while loading core:\n", e.stack);
            });
    }

    public readonly client: Client = new Client(this.token, this.erisOptions);
    public readonly ws: SockConnection = new SockConnection(this);

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

    public loadCore (): Promise<Core> {
        if (this.core) {
            return Promise.reject(new Error("Core is already loaded"));
        }
        const C = require("../core/Core");
        const core: Core = new C(this);
        this.core = core;

        return Promise.resolve(core);
    }

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
