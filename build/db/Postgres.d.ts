/// <reference types="node" />
import { Guild } from "eris";
import { EventEmitter } from "events";
import { ClientConfig, QueryResult } from "pg";
import { Readable, Writable } from "stream";
import { Logger } from "../client/Logger";
import { Shard } from "../client/Shard";
/**
 * Database guild object
 *
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
 */
export declare class Postgres extends EventEmitter {
    private shard;
    private options;
    /**
     * Creates an instance of Postgres.
     * @param {Shard} shard
     * @param {ClientConfig} options
     */
    constructor(shard: Shard, options: ClientConfig);
    /**
     * "pg" client
     *
     * @private
     */
    private con;
    /**
     * Logger
     *
     */
    readonly logger: Logger;
    /**
     * Connect to the database
     *
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the database
     *
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
    /**
     * Release an error
     *
     * @param {Error} err
     * @returns {void}
     */
    release(err: Error): void;
    /**
     * Query the database
     *
     * @param {(string} query
     * @param {any[]} [values]
     * @returns {(Promise<QueryResult>)}
     */
    query(query: string, values?: any[]): Promise<QueryResult>;
    /**
     * Copy from something
     *
     * @param {string} queryText
     * @returns {Writable}
     */
    copyFrom(queryText: string): Writable;
    /**
     * Copy to something
     *
     * @param {string} queryText
     * @returns {Readable}
     */
    copyTo(queryText: string): Readable;
    /**
     * Pause the drain
     *
     * @returns {void}
     */
    pauseDrain(): void;
    /**
     * Resume the drain
     *
     * @returns {void}
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
     */
    insert(table: string, data: any): Promise<QueryResult>;
    /**
     * Get data from the database
     *
     * @param {string} table
     * @param {string} expr
     * @returns {Promise<QueryResult>}
     */
    get(table: string, expr: string): Promise<QueryResult>;
    /**
     * Update a doc in the database
     *
     * @param {string} table
     * @param {string} expr
     * @param {*} data
     * @returns {Promise<QueryResult>}
     */
    update(table: string, expr: string, data: any): Promise<QueryResult>;
    /**
     * Add a guild to the database
     *
     * @param {(Guild | string)} guild
     * @returns {Promise<QueryResult>}
     */
    addGuild(guild: Guild | string): Promise<QueryResult>;
}
