"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const events_1 = require("events");
const sanic = require("sanic");
const ExtManager_1 = require("../core/ExtManager");
const Postgres_1 = require("../db/Postgres");
const Connection_1 = require("./Connection");
class Shard extends events_1.EventEmitter {
    constructor(token, options) {
        super();
        this.token = token;
        this.options = options;
        this.client = new eris_1.Client(this.token, this.erisOptions);
        this.postgres = new Postgres_1.Postgres(this.options.postgres);
        this.ext = new ExtManager_1.ExtManager(this.options.ext);
        this.sock = new Connection_1.SockConnection(this);
    }
    connect() {
        return sanic(function* () {
            yield this.postgres.connect();
            yield this.ext.load();
            yield this.client.connect();
        })();
    }
}
exports.Shard = Shard;
