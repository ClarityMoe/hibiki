// Postgres.ts - PostgreSQL wrapper (noud02)

import { Guild, Message, User } from "eris";
import { EventEmitter } from "events";
import { Client, ClientConfig, QueryConfig, QueryResult } from "pg";
import sanic = require("sanic");
import { Readable, Writable } from "stream";
import { Shard } from "../client/Shard";

export interface IDBGuild {
    id: string;
    name: string;
    ownerID: string;
}

export interface IDBUser {
    id: string;
    username: string;
    discriminator: string;
}

/**
 * PostgreSQL wrapper
 *
 * @export
 * @class Postgres
 * @extends {EventEmitter}
 */
export class Postgres extends EventEmitter {

    /**
     * Creates an instance of Postgres.
     * @param {Shard} shard
     * @param {ClientConfig} options
     * @memberof Postgres
     */
    constructor (private shard: Shard, private options: ClientConfig) {
        super();
    }

    /**
     * "pg" client
     *
     * @private
     * @type {Client}
     * @memberof Postgres
     */
    private con: Client = new Client(this.options);

    /**
     * Connect to the database
     *
     * @returns {Promise<void>}
     * @memberof Postgres
     */
    public connect (): Promise<void> {
        return new Promise((resolve, reject) => {
            this.con.connect((e: Error) => {
                if (e) {
                    return reject(e);
                }

                this.con.on("drain", () => this.emit("drain"));
                this.con.on("error", (err: Error) => this.emit("error", err));
                this.con.on("notification", (msg: any) => this.emit("notification", msg));
                this.con.on("notice", (msg: any) => this.emit("notice", msg));
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
    public disconnect (): Promise<void> {
        return new Promise((resolve, reject) => {
            this.con.end((err: Error) => {
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
    public release (err: Error): void {
        return this.con.release(err);
    }

    /**
     * Query the database
     *
     * @param {(string | QueryConfig & Readable | QueryConfig)} query
     * @param {any[]} [values]
     * @returns {(Promise<QueryResult> | Readable)}
     * @memberof Postgres
     */
    public query (query: string | QueryConfig & Readable | QueryConfig, values?: any[]): Promise<QueryResult> | Readable {
        if (values) {
            return this.con.query(query, values);
        } else {
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
    public copyFrom (queryText: string): Writable {
        return this.con.copyFrom(queryText);
    }

    /**
     * Copy to something
     *
     * @param {string} queryText
     * @returns {Readable}
     * @memberof Postgres
     */
    public copyTo (queryText: string): Readable {
        return this.con.copyTo(queryText);
    }

    /**
     * Pause the drain
     *
     * @returns {void}
     * @memberof Postgres
     */
    public pauseDrain (): void {
        return this.con.pauseDrain();
    }

    /**
     * Resume the drain
     *
     * @returns {void}
     * @memberof Postgres
     */
    public resumeDrain (): void {
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
    public insert (table: string, data: any): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            const this_: this = this;
            sanic(function* () {
                const vals: any[] = [];
                const keys: string[] = Object.keys(data);
                for (const key of keys) {
                    vals.push(data[key]);
                }

                const q: QueryResult = yield this_.query(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")});`, vals);

                return resolve(q);
            })()
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
    public get (table: string, expr: string): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            const this_: this = this;
            sanic(function* () {
                const q: QueryResult = yield this_.query(`SELECT * FROM ${table} WHERE ${expr};`);

                return resolve(q);
            })()
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
    public update (table: string, expr: string, data: any): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            const this_: this = this;
            sanic(function* () {
                const vals: any[] = [];
                const keys: string[] = Object.keys(data);
                const changes: string[] = [];
                for (const key of keys) {
                    vals.push(data[key]);
                    changes.push(`${key} = $${keys.indexOf(key) + 1}`);
                }

                const q: QueryResult = yield this_.query(`UPDATE ${table} SET ${changes.join(", ")} WHERE ${expr};`, vals);

                return resolve(q);
            })()
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
    public addGuild (guild: Guild | string): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            const this_: this = this;
            sanic(function* () {
                let g: Guild = guild instanceof Guild && guild || this_.shard.client.guilds.get(guild);

                if (!g) {
                    g = yield this_.shard.ws.getGuild(g);
                }

                const obj: IDBGuild = {
                    id: g.id,
                    name: g.name,
                    ownerID: g.ownerID,
                };

                const q: QueryResult = yield this_.insert("guilds", obj);

                return resolve(q);
            })()
                .catch(reject);
        });
    }
}
