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
 */
class Shard extends events_1.EventEmitter {
    /**
     * Creates an instance of Shard.
     * @param {string} token
     * @param {IShardOptions} options
     */
    constructor(id, token, options) {
        super();
        this.id = id;
        this.token = token;
        this.options = options;
        /**
         * Logger class
         *
         */
        this.logger = new Logger_1.Logger(this);
        /**
         * Eris options
         *
         * @private
         */
        this.erisOptions = {};
        /**
         * Eris client
         *
         */
        this.client = new eris_1.Client(this.token, this.erisOptions);
        /**
         * WebSocket connection
         *
         */
        this.ws = new Connection_1.Connection(this);
        this.loadCore()
            .then(() => {
            return this.logger.ok("Core loaded");
        })
            .catch((e) => {
            return this.logger.fail("Error while loading core:\n", e.stack);
        });
    }
    /**
     * Connects the shard.
     *
     * @returns {Promise<void>}
     */
    connect() {
        if (!this.core) {
            return Promise.reject(new Error("Core is not loaded"));
        }
        const this_ = this;
        return sanic(function* () {
            yield this_.client.connect();
            yield this_.ws.connect();
            if (this_.core) {
                yield this_.core.connect(10000);
            }
        })();
    }
    /**
     * Disconnects the shard.
     *
     * @returns
     */
    disconnect() {
        const this_ = this;
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
    loadCore() {
        if (this.core) {
            return Promise.reject(new Error("Core is already loaded"));
        }
        const C = require("../core/Core").Core;
        const core = new C(this);
        this.core = core;
        return Promise.resolve(core);
    }
    /**
     * Unloads the core (if loaded)
     *
     * @returns {Promise<Core>}
     */
    unloadCore() {
        if (!this.core) {
            return Promise.reject(new Error("Core is not loaded"));
        }
        const this_ = this;
        return sanic(function* () {
            if (this_.core) {
                const core = this_.core;
                yield this_.core.disconnect();
                this_.core = null;
                this_.logger.ok("Unloaded core");
                return core;
            }
        })();
    }
    /**
     * Reloads the core
     *
     * @returns {Promise<Core>}
     */
    reloadCore() {
        return new Promise((resolve, reject) => {
            const this_ = this;
            sanic(function* () {
                if (this_.core) {
                    yield this_.core.disconnect();
                }
                const C = require("../core/Core").Core;
                const core = new C(this_);
                this_.core = core;
                return resolve(core);
            })()
                .catch(reject);
        });
    }
}
exports.Shard = Shard;
