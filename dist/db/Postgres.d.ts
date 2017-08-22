/// <reference types="node" />
import { Guild } from "eris";
import { EventEmitter } from "events";
import { ClientConfig, QueryResult } from "pg";
import { Readable, Writable } from "stream";
import { Shard } from "../client/Shard";
/**
 * Database guild object
 *
 * @export
 * @interface IDBGuild
 */
export interface IDBGuild {
    id: string;
    name: string;
    ownerID: string;
}
/**
 * Database user object
 *
 * @export
 * @interface IDBUser
 */
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
export declare class Postgres extends EventEmitter {
    private shard;
    private options;
    /**
     * Creates an instance of Postgres.
     * @param {Shard} shard
     * @param {ClientConfig} options
     * @memberof Postgres
     */
    constructor(shard: Shard, options: ClientConfig);
    /**
     * "pg" client
     *
     * @private
     * @type {Client}
     * @memberof Postgres
     */
    private con;
    /**
     * Connect to the database
     *
     * @returns {Promise<void>}
     * @memberof Postgres
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the database
     *
     * @returns {Promise<void>}
     * @memberof Postgres
     */
    disconnect(): Promise<void>;
    /**
     * Release an error
     *
     * @param {Error} err
     * @returns {void}
     * @memberof Postgres
     */
    release(err: Error): void;
    /**
     * Query the database
     *
     * @param {(string} query
     * @param {any[]} [values]
     * @returns {(Promise<QueryResult>)}
     * @memberof Postgres
     */
    query(query: string, values?: any[]): Promise<QueryResult>;
    /**
     * Copy from something
     *
     * @param {string} queryText
     * @returns {Writable}
     * @memberof Postgres
     */
    copyFrom(queryText: string): Writable;
    /**
     * Copy to something
     *
     * @param {string} queryText
     * @returns {Readable}
     * @memberof Postgres
     */
    copyTo(queryText: string): Readable;
    /**
     * Pause the drain
     *
     * @returns {void}
     * @memberof Postgres
     */
    pauseDrain(): void;
    /**
     * Resume the drain
     *
     * @returns {void}
     * @memberof Postgres
     */
    resumeDrain(): void;
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
    insert(table: string, data: any): Promise<QueryResult>;
    /**
     * Get data from the database
     *
     * @param {string} table
     * @param {string} expr
     * @returns {Promise<QueryResult>}
     * @memberof Postgres
     */
    get(table: string, expr: string): Promise<QueryResult>;
    /**
     * Update a doc in the database
     *
     * @param {string} table
     * @param {string} expr
     * @param {*} data
     * @returns {Promise<QueryResult>}
     * @memberof Postgres
     */
    update(table: string, expr: string, data: any): Promise<QueryResult>;
    /**
     * Add a guild to the database
     *
     * @param {(Guild | string)} guild
     * @returns {Promise<QueryResult>}
     * @memberof Postgres
     */
    addGuild(guild: Guild | string): Promise<QueryResult>;
}
