import { Client, ClientOptions } from "eris";
import { EventEmitter } from "events";
import sanic = require("sanic");
import { Core, ICoreOptions } from "../core/Core";
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
    disabledEvents: string[];
    ext: IExtManagerOptions;
}

export class Shard extends EventEmitter {

    private readonly logger: Logger = new Logger(this);

    public core: Core|void;

    constructor(private token: string, public options: IShardOptions) {
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

    public connect(): Promise<void> {
        return sanic(function*() {
            yield this.client.connect();
            yield this.core.connect();
        })();
    }

    public loadCore(): Promise<Core> {
        if (this.core) {
            return Promise.reject(new Error("Core is already loaded"));
        }
        const C = require("../core/Core");
        const core: C = new C(this);
        this.core = core;
        return Promise.resolve(core);
    }

    public unloadCore(): Promise<Core> {
        return new Promise((resolve, reject) => {
            if (!this.core) {
                return reject(new Error("Core is not loaded"));
            }
            const _this: this = this;
            sanic(function*() {
                const core: Core = _this.core;
                yield _this.core.disconnect();
                _this.core = null;
                return resolve(core);
            })()
                .catch(reject);
        });
    }

    public reloadCore(): Promise<Core> {
        return new Promise((resolve, reject) => {
            const _this: this = this;
            sanic(function*() {
                if (_this.core) {
                    yield _this.core.disconnect();
                }

                const C = require("../core/Core");
                const core: C = new C(_this);
                _this.core = core;
                return resolve(core);
            })()
                .catch(reject);
        });
    }

}
