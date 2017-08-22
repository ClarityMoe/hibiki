import { Guild, Message, User } from "eris";
import { EventEmitter } from "events";
import { Client, ClientConfig, QueryConfig, QueryResult } from "pg";
import sanic = require("sanic");
import { Readable, Writeable } from "stream";
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

export class Postgres extends EventEmitter {

    constructor(private shard: Shard, private options: ClientConfig) {
        super();
    }

    private con: Client = new Client(this.options);

    public connect(): Promise<void> {
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

    public disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.con.end((err: Error) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        });
    }

    public release(err: Error): void {
        return this.con.release(err);
    }

    public query(query: string | QueryConfig & Readable | QueryConfig,
                 values?: any[]): Promise<QueryResult> | Readable {
        if (values) {
            return this.con.query(query, values);
        } else {
            return this.con.query(query);
        }
    }

    public copyFrom(queryText: string): Readable {
        return this.con.copyFrom(queryText);
    }

    public copyTo(queryText: string): Writeable {
        return this.con.copyTo(queryText);
    }

    public pauseDrain(): void {
        return this.con.pauseDrain();
    }

    public resumeDrain(): void {
        return this.con.resumeDrain();
    }

    /**
     * Functions to make life easier
     */

    public insert(table: string, data: Object): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            const _this: this = this;
            sanic(function*() {
                const vals: any[] = [];
                const keys: string[] = Object.keys(data);
                for (const key of keys) {
                    vals.push(data[key]);
                }

                const q: QueryResult = yield _this.query(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((val, i) => `$${i + 1}`).join(", ")});`, vals);
                return resolve(q);
            })()
                .catch(reject);
        });
    }

    public get(table: string, expr: string): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            const _this: this = this;
            sanic(function*() {
                const q: QueryResult = yield _this.query(`SELECT * FROM ${table} WHERE ${expr};`);
                return resolve(q);
            })()
                .catch(reject);
        });
    }

    public update(table: string, expr: string, data: any): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            const _this: this = this;
            sanic(function*() {
                const vals: any[] = [];
                const keys: string[] = Object.keys(data);
                const changes: string[] = [];
                for (const key of keys) {
                    vals.push(data[key]);
                    changes.push(`${key} = $${keys.indexOf(key) + 1}`);
                }

                const q: QueryResult = yield _this.query(`UPDATE ${table} SET ${changes.join(", ")} WHERE ${expr};`, vals);
                return resolve(q);
            })();
        });
    }

    public addGuild(guild: Guild | string): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            const _this: this = this;
            sanic(function*() {
                let g: Guild = guild instanceof Guild && guild || _this.shard.client.guilds.get(guild);

                if (!g) {
                    try {
                        g = yield _this.shard.sock.getGuild(g);
                    } catch (e) {
                        return reject(e);
                    }
                }

                const obj: IDBGuild = {
                    id: g.id,
                    name: g.name,
                    ownerID: g.ownerID,
                };
                try {
                    const q: QueryResult = yield _this.insert("guilds", obj);
                    return resolve(q);
                } catch (e) {
                    return reject(e);
                }
            })();
        });
    }
}
