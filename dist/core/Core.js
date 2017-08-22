"use strict";
// Core.ts - Core of the bot (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const sanic = require("sanic");
const Postgres_1 = require("../db/Postgres");
const Redis_1 = require("../db/Redis");
const ExtManager_1 = require("./ExtManager");
class Core extends events_1.EventEmitter {
    constructor(shard) {
        super();
        this.shard = shard;
        this.ext = new ExtManager_1.ExtManager(this.shard);
        this.pg = new Postgres_1.Postgres(this.shard, this.shard.options.db.postgres);
        this.r = new Redis_1.Redis(this.shard, this.shard.options.db.redis);
    }
    connect(timeout) {
        return new Promise((resolve, reject) => {
            const this_ = this;
            const conTimeout = setTimeout(() => reject(new Error("Connect timed out")), timeout);
            sanic(function* () {
                yield this_.pg.connect();
                yield this_.r.connect();
                yield this_.shard.ws.connect();
                yield this_.ext.init();
            })()
                .then(() => {
                clearTimeout(conTimeout);
                resolve();
            })
                .catch(reject);
        });
    }
    disconnect() {
        return new Promise((resolve, reject) => {
            const this_ = this;
            sanic(function* () {
                yield this_.ext.break();
                yield this_.shard.ws.disconnect();
                yield this_.r.disconnect();
                yield this_.pg.disconnect();
            })()
                .then(resolve)
                .catch(reject);
        });
    }
}
exports.Core = Core;
