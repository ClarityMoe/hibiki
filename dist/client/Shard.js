"use strict";
// Shard.ts - Shard class (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const events_1 = require("events");
const sanic = require("sanic");
const Connection_1 = require("./Connection");
const Logger_1 = require("./Logger");
/**
 * Shard class
 *
 * @export
 * @class Shard
 * @extends {EventEmitter}
 */
class Shard extends events_1.EventEmitter {
    /**
     * Creates an instance of Shard.
     * @param {string} token
     * @param {IShardOptions} options
     * @memberof Shard
     */
    constructor(token, options) {
        super();
        this.token = token;
        this.options = options;
        /**
         * Logger class
         *
         * @private
         * @type {Logger}
         * @memberof Shard
         */
        this.logger = new Logger_1.Logger(this);
        /**
         * Eris client
         *
         * @type {Eris.Client}
         * @memberof Shard
         */
        this.client = new eris_1.Client(this.token, this.erisOptions);
        /**
         * WebSocket connection
         *
         * @type {SockConnection}
         * @memberof Shard
         */
        this.ws = new Connection_1.SockConnection(this);
        /**
         * Shard ID
         *
         * @type {number}
         * @memberof Shard
         */
        this.id = this.options.useENV && Number(process.env.SHARD_ID) || 1;
        this.loadCore()
            .then(() => {
            return this.logger.ok("Core loaded");
        })
            .catch((e) => {
            return this.logger.fail("Error while loading core:\n", e.stack);
        });
    }
    /**
     * Connects the shard and core
     *
     * @returns {Promise<void>}
     * @memberof Shard
     */
    connect() {
        if (!this.core) {
            return Promise.reject(new Error("Core is not loaded"));
        }
        const this_ = this;
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
     * @memberof Shard
     */
    loadCore() {
        if (this.core) {
            return Promise.reject(new Error("Core is already loaded"));
        }
        const C = require("../core/Core");
        const core = new C(this);
        this.core = core;
        return Promise.resolve(core);
    }
    /**
     * Unloads the core (if loaded)
     *
     * @returns {Promise<Core>}
     * @memberof Shard
     */
    unloadCore() {
        return new Promise((resolve, reject) => {
            if (!this.core) {
                return reject(new Error("Core is not loaded"));
            }
            const this_ = this;
            sanic(function* () {
                if (this_.core) {
                    const core = this_.core;
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
     * @memberof Shard
     */
    reloadCore() {
        return new Promise((resolve, reject) => {
            const this_ = this;
            sanic(function* () {
                if (this_.core) {
                    yield this_.core.disconnect();
                }
                const C = require("../core/Core");
                const core = new C(this_);
                this_.core = core;
                return resolve(core);
            })()
                .catch(reject);
        });
    }
}
exports.Shard = Shard;
