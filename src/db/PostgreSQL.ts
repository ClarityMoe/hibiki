// PostgreSQL.ts - PostgreSQL client (noud02)

import { exec } from "child_process";
import * as Eris from "eris";
import * as pg from "pg";

export interface IDBGuild {
    id: string;
    prefixes: string[];
    name: string;
    queue: Array<{ [key: string]: any }>; /** @todo add music things and replace this with a proper queue interface */
}

/**
 * PostgreSQL client class
 *
 * @export
 * @class PostgreSQL
 */
export class PostgreSQL {

    /**
     * `pg` client
     * @see https://node-postgres.com/
     *
     * @type {pg.Client}
     */
    public client: pg.Client = new pg.Client(this.options);

    constructor (private options: pg.ClientConfig) {}

    /**
     * Connects the client to the database
     *
     * @returns {Promise<void>}
     */
    public connect (): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.connect((err: Error) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        });
    }

    /**
     * Disconnects the client from the database
     *
     * @returns {Promise<void>}
     */
    public disconnect (): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.end((err: Error) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        });
    }

    /**
     * Execute a raw query (command)
     *
     * @param {string} query Query, eg: `SELECT * FROM guilds;`
     * @returns {Promise<string>}
     */
    public rawQuery (query: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(`psql ${this.options.database} -c '${query}'`, (err: Error, stdout: string) => {
                if (err) {
                    return reject(err);
                }

                return resolve(stdout);
            });
        });
    }

    /**
     * Insert data into a table
     *
     * @param {string} table Table to query
     * @param {*} data Data to insert
     * @returns {Promise<pg.QueryResult>}
     */
    public insert (table: string, data: { [key: string]: any }): Promise<pg.QueryResult> {
        const vals: any[] = [];
        const keys: string[] = Object.keys(data);

        for (const key of keys) {
            vals.push(data[key]);
        }

        return this.client.query(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((_key, i) => `$${i + 1}`).join(", ")});`, vals);
    }

    /**
     * Update data in a table
     *
     * @example PostgreSQL.update('nya', 'id = "awoo"', { reee: true });
     *
     * @param {string} table Table to query
     * @param {string} expression Expression, eg: `id = 123456, name = "awoo"`
     * @param {*} data New data
     * @returns {Promise<pg.QueryResult>}
     */
    public update (table: string, expression: string, data: { [key: string]: any }): Promise<pg.QueryResult> {
        const vals: any[] = [];
        const keys: string[] = Object.keys(data);
        const changes: string[] = [];

        for (const key of keys) {
            vals.push(data[key]);
            changes.push(`${key} = $${keys.indexOf(key) + 1}`);
        }

        return this.client.query(`UPDATE ${table} SET ${changes.join(", ")} WHERE ${expression};`, vals);
    }

    /**
     * Select data from database
     *
     * @example PostgreSQL.select('nyan', 'id = "awoo"')
     *
     * @param {string} table Table to query
     * @param {string} expression Expression, eg: `id = 123456, name = "awoo"`
     * @returns {Promise<pg.QueryResult>}
     */
    public select (table: string, expression: string): Promise<pg.QueryResult> {
        return this.client.query(`SELECT * FROM ${table} WHERE ${expression};`);
    }

    public async addGuild (guild: Eris.Guild): Promise<pg.QueryResult> {
        const data: IDBGuild = {
            id: guild.id,
            name: guild.name,
            prefixes: [],
            queue: [],
        };

        const query: pg.QueryResult = await this.select("guilds", `id = '${guild.id}'`);

        if (query.rows.length > 0) {
            return query;
        } else {
            return this.insert("guilds", data);
        }
    }
}
