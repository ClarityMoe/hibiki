import { EventEmitter } from "events";
import sanic = require("sanic");
import { Shard } from "../client/Shard";
import { Postgres } from "../db/Postgres";
import { Redis } from "../db/Redis";
import { ExtManager } from "./ExtManager";

export class Core extends EventEmitter {

    constructor(private shard: Shard) {
        super();
    }

    public ext: ExtManager = new ExtManager(this.shard);
    public pg: Postgres = new Postgres(this.shard, this.shard.options.db.postgres);
    public r: Redis = new Redis(this.shard, this.shard.options.db.redis);

    public connect(timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const _this: this = this;
            const conTimeout: any = setTimeout(() => reject(new Error("Connect timed out")), timeout);
            sanic(function*() {
                yield _this.pg.connect();
                yield _this.r.connect();
                yield _this.shard.ws.connect();
                yield _this.ext.init();
            })()
                .then(() => {
                    clearTimeout(conTimeout);
                    return resolve();
                })
                .catch(reject);
        });
    }

    public disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const _this: this = this;
            sanic(function*() {
                yield _this.ext.break();
                yield _this.shard.ws.disconnect();
                yield _this.r.disconnect();
                yield _this.pg.disconnect();
            })()
                .then(resolve)
                .catch(reject);
        });
    }

}
