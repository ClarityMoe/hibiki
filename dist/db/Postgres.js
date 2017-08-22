"use strict";
// Postgres.ts - PostgreSQL wrapper (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const events_1 = require("events");
const pg_1 = require("pg");
const sanic = require("sanic");
/**
 * PostgreSQL wrapper
 *
 * @export
 * @class Postgres
 * @extends {EventEmitter}
 */
class Postgres extends events_1.EventEmitter {
    /**
     * Creates an instance of Postgres.
     * @param {Shard} shard
     * @param {ClientConfig} options
     * @memberof Postgres
     */
    constructor(shard, options) {
        super();
        this.shard = shard;
        this.options = options;
        /**
         * "pg" client
         *
         * @private
         * @type {Client}
         * @memberof Postgres
         */
        this.con = new pg_1.Client(this.options);
    }
    /**
     * Connect to the database
     *
     * @returns {Promise<void>}
     * @memberof Postgres
     */
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
    /**
     * Disconnect from the database
     *
     * @returns {Promise<void>}
     * @memberof Postgres
     */
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
    /**
     * Release an error
     *
     * @param {Error} err
     * @returns {void}
     * @memberof Postgres
     */
    release(err) {
        return this.con.release(err);
    }
    /**
     * Query the database
     *
     * @param {(string} query
     * @param {any[]} [values]
     * @returns {(Promise<QueryResult>)}
     * @memberof Postgres
     */
    query(query, values) {
        if (values) {
            return this.con.query(query, values);
        }
        else {
            return this.con.query(query);
        }
    }
    /**
     * Copy from something
     *
     * @param {string} queryText
     * @returns {Writable}
     * @memberof Postgres
     */
    copyFrom(queryText) {
        return this.con.copyFrom(queryText);
    }
    /**
     * Copy to something
     *
     * @param {string} queryText
     * @returns {Readable}
     * @memberof Postgres
     */
    copyTo(queryText) {
        return this.con.copyTo(queryText);
    }
    /**
     * Pause the drain
     *
     * @returns {void}
     * @memberof Postgres
     */
    pauseDrain() {
        return this.con.pauseDrain();
    }
    /**
     * Resume the drain
     *
     * @returns {void}
     * @memberof Postgres
     */
    resumeDrain() {
        return this.con.resumeDrain();
    }
    /**
     * Functions to make life easier
     */
    /**
     * Insert data in the database
     *
     * @param {string} table
     * @param {*} data
     * @returns {Promise<QueryResult>}
     * @memberof Postgres
     */
    insert(table, data) {
        return new Promise((resolve, reject) => {
            const this_ = this;
            sanic(function* () {
                const vals = [];
                const keys = Object.keys(data);
                for (const key of keys) {
                    vals.push(data[key]);
                }
                const q = yield this_.query(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")});`, vals);
                return q;
            })()
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * Get data from the database
     *
     * @param {string} table
     * @param {string} expr
     * @returns {Promise<QueryResult>}
     * @memberof Postgres
     */
    get(table, expr) {
        return new Promise((resolve, reject) => {
            const this_ = this;
            sanic(function* () {
                const q = yield this_.query(`SELECT * FROM ${table} WHERE ${expr};`);
                return q;
            })()
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * Update a doc in the database
     *
     * @param {string} table
     * @param {string} expr
     * @param {*} data
     * @returns {Promise<QueryResult>}
     * @memberof Postgres
     */
    update(table, expr, data) {
        return new Promise((resolve, reject) => {
            const this_ = this;
            sanic(function* () {
                const vals = [];
                const keys = Object.keys(data);
                const changes = [];
                for (const key of keys) {
                    vals.push(data[key]);
                    changes.push(`${key} = $${keys.indexOf(key) + 1}`);
                }
                const q = yield this_.query(`UPDATE ${table} SET ${changes.join(", ")} WHERE ${expr};`, vals);
                return q;
            })()
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * Add a guild to the database
     *
     * @param {(Guild | string)} guild
     * @returns {Promise<QueryResult>}
     * @memberof Postgres
     */
    addGuild(guild) {
        return new Promise((resolve, reject) => {
            const this_ = this;
            sanic(function* () {
                let g = guild instanceof eris_1.Guild && guild || this_.shard.client.guilds.get(guild);
                if (!g && typeof guild === "string") {
                    g = yield this_.shard.ws.getGuild(guild);
                }
                if (g) {
                    const obj = {
                        id: g.id,
                        name: g.name,
                        ownerID: g.ownerID,
                    };
                    const q = yield this_.insert("guilds", obj);
                    return q;
                }
                else {
                    throw new Error("Guild not found");
                }
            })()
                .then(resolve)
                .catch(reject);
        });
    }
}
exports.Postgres = Postgres;
