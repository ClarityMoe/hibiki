// PostgreSQL.ts - PostgreSQL client (noud02)

import { exec } from "child_process";
import * as pg from "pg";

export class PostgreSQL {

    public client: pg.Client = new pg.Client(this.options);

    constructor (private options: pg.ClientConfig) {}

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

    public insert (table: string, data: any): Promise<pg.QueryResult> {
        const vals: any[] = [];
        const keys: string[] = Object.keys(data);

        for (const key of keys) {
            vals.push(data[key]);
        }

        return this.client.query(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((_key, i) => `$${i + 1}`).join(", ")});`, vals);
    }

    public update (table: string, expression: string, data: any): Promise<pg.QueryResult> {
        const vals: any[] = [];
        const keys: string[] = Object.keys(data);
        const changes: string[] = [];

        for (const key of keys) {
            vals.push(data[key]);
            changes.push(`${key} = $${keys.indexOf(key) + 1}`);
        }

        return this.client.query(`UPDATE ${table} SET ${changes.join(", ")} WHERE ${expression};`, vals);
    }

    public select (table: string, expression: string): Promise<pg.QueryResult> {
        return this.client.query(`SELECT * FROM ${table} WHERE ${expression};`);
    }
}
