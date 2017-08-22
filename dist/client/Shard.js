"use strict";
// Shard.ts - Shard class (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const events_1 = require("events");
const sanic = require("sanic");
const Connection_1 = require("./Connection");
const Logger_1 = require("./Logger");
class Shard extends events_1.EventEmitter {
    constructor(token, options) {
        super();
        this.token = token;
        this.options = options;
        this.logger = new Logger_1.Logger(this);
        this.client = new eris_1.Client(this.token, this.erisOptions);
        this.ws = new Connection_1.SockConnection(this);
        this.loadCore()
            .then(() => {
            return this.logger.ok("Core loaded");
        })
            .catch((e) => {
            return this.logger.err("Error while loading core:\n", e.stack);
        });
    }
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
    loadCore() {
        if (this.core) {
            return Promise.reject(new Error("Core is already loaded"));
        }
        const C = require("../core/Core");
        const core = new C(this);
        this.core = core;
        return Promise.resolve(core);
    }
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
