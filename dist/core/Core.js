"use strict";
// Core.ts - Core of the bot (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const sanic = require("sanic");
const Postgres_1 = require("../db/Postgres");
const Redis_1 = require("../db/Redis");
const ExtManager_1 = require("./ExtManager");
/**
 * Core of the bot
 *
 * @export
 * @class Core
 * @extends {EventEmitter}
 */
class Core extends events_1.EventEmitter {
    /**
     * Creates an instance of Core.
     * @param {Shard} shard
     * @memberof Core
     */
    constructor(shard) {
        super();
        this.shard = shard;
        /**
         * Extension manager class
         *
         * @type {ExtManager}
         * @memberof Core
         */
        this.ext = new ExtManager_1.ExtManager(this.shard);
        /**
         * Postgres wrapper class
         *
         * @type {Postgres}
         * @memberof Core
         */
        this.pg = new Postgres_1.Postgres(this.shard, this.shard.options.db.postgres);
        /**
         * Redis wrapper class
         *
         * @type {Redis}
         * @memberof Core
         */
        this.r = new Redis_1.Redis(this.shard.options.db.redis);
    }
    /**
     * Connect all modules
     *
     * @param {number} timeout
     * @returns {Promise<void>}
     * @memberof Core
     */
    connect(timeout) {
        return new Promise((resolve, reject) => {
            const this_ = this;
            const conTimeout = setTimeout(() => reject(new Error("Connect timed out")), timeout);
            sanic(function* () {
                yield this_.pg.connect();
                yield this_.r.connect();
                // yield this_.shard.ws.connect();
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
     * @memberof Core
     */
    disconnect() {
        return new Promise((resolve, reject) => {
            const this_ = this;
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
exports.Core = Core;
