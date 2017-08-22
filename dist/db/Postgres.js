"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const events_1 = require("events");
const pg_1 = require("pg");
const sanic = require("sanic");
const stream_1 = require("stream");
class Postgres extends events_1.EventEmitter {
    constructor(shard, options) {
        super();
        this.shard = shard;
        this.options = options;
        this.con = new pg_1.Client(this.options);
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.con.connect((e) => {
                if (e) {
                    return reject(e);
                }
                this.con.on("drain", () => this.emit("drain"));
                this.con.on("error", (err) => this.emit("error", err));
                this.con.on("notification", (msg) => this.emit("notification", msg));
                this.con.on("notice", (msg) => this.emit("notice", msg));
                this.con.on("end", () => this.emit("end"));
                return resolve();
            });
        });
    }
    disconnect() {
        return new Promise((resolve, reject) => {
            this.con.end((err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }
    release(err) {
        return this.con.release(err);
    }
    query(query, values) {
        return new Promise((resolve, reject) => {
            const _this = this;
            sanic(function* () {
                if (values) {
                    return resolve(yield _this.con.query(query, values));
                }
                else {
                    try {
                        const q = _this.con.query(query);
                        if (q instanceof stream_1.Readable) {
                            return resolve(q);
                        }
                        return resolve(yield q);
                    }
                    catch (e) {
                        return reject(e);
                    }
                }
            })();
        });
    }
    copyFrom(queryText) {
        return this.con.copyFrom(queryText);
    }
    copyTo(queryText) {
        return this.con.copyTo(queryText);
    }
    pauseDrain() {
        return this.con.pauseDrain();
    }
    resumeDrain() {
        return this.con.resumeDrain();
    }
    /**
     * Functions to make life easier
     */
    insert(table, data) {
        return new Promise((resolve, reject) => {
            const _this = this;
            sanic(function* () {
                try {
                    const vals = [];
                    const keys = Object.keys(data);
                    for (const key of keys) {
                        vals.push(data[key]);
                    }
                    const q = yield _this.query(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((val, i) => `$${i + 1}`).join(", ")});`, vals);
                    return resolve(q);
                }
                catch (e) {
                    return reject(e);
                }
            })();
        });
    }
    get(table, expr) {
        return new Promise((resolve, reject) => {
            const _this = this;
            sanic(function* () {
                try {
                    const q = yield _this.query(`SELECT * FROM ${table} WHERE ${expr};`);
                    return resolve(q);
                }
                catch (e) {
                    return reject(e);
                }
            })();
        });
    }
    update(table, expr, data) {
        return new Promise((resolve, reject) => {
            const _this = this;
            sanic(function* () {
                try {
                    const vals = [];
                    const keys = Object.keys(data);
                    const changes = [];
                    for (const key of keys) {
                        vals.push(data[key]);
                        changes.push(`${key} = $${keys.indexOf(key) + 1}`);
                    }
                    const q = yield _this.query(`UPDATE ${table} SET ${changes.join(", ")} WHERE ${expr};`, vals);
                    return resolve(q);
                }
                catch (e) {
                    return reject(e);
                }
            })();
        });
    }
    addGuild(guild) {
        return new Promise((resolve, reject) => {
            const _this = this;
            sanic(function* () {
                let g = guild instanceof eris_1.Guild && guild || _this.shard.client.guilds.get(guild);
                if (!g) {
                    try {
                        g = yield _this.shard.sock.getGuild(g);
                    }
                    catch (e) {
                        return reject(e);
                    }
                }
                const obj = {
                    id: g.id,
                    name: g.name,
                    ownerID: g.ownerID,
                };
                try {
                    const q = yield _this.insert("guilds", obj);
                    return resolve(q);
                }
                catch (e) {
                    return reject(e);
                }
            })();
        });
    }
}
exports.Postgres = Postgres;
