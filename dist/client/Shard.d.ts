/// <reference types="node" />
import { Client } from "eris";
import { EventEmitter } from "events";
import * as pg from "pg";
import * as redis from "redis";
import { Core } from "../core/Core";
import { SockConnection } from "./Connection";
/**
 * Shard options
 *
 * @export
 * @interface IShardOptions
 */
export interface IShardOptions {
    db: {
        postgres: pg.ClientConfig;
        redis: redis.ClientOpts;
    };
    shards: Array<{
        id: number;
        server: {
            host: string;
        };
    }>;
    logger: {
        debug: boolean;
    };
    disabledEvents: string[];
    useENV: boolean;
}
/**
 * Shard class
 *
 * @export
 * @class Shard
 * @extends {EventEmitter}
 */
export declare class Shard extends EventEmitter {
    private token;
    options: IShardOptions;
    /**
     * Logger class
     *
     * @private
     * @type {Logger}
     * @memberof Shard
     */
    private readonly logger;
    /**
     * Eris options
     *
     * @private
     * @type {ClientOptions}
     * @memberof Shard
     */
    private erisOptions;
    /**
     * Core
     *
     * @type {(Core | null)}
     * @memberof Shard
     */
    core: Core | null;
    /**
     * Creates an instance of Shard.
     * @param {string} token
     * @param {IShardOptions} options
     * @memberof Shard
     */
    constructor(token: string, options: IShardOptions);
    /**
     * Eris client
     *
     * @type {Eris.Client}
     * @memberof Shard
     */
    readonly client: Client;
    /**
     * WebSocket connection
     *
     * @type {SockConnection}
     * @memberof Shard
     */
    readonly ws: SockConnection;
    /**
     * Shard ID
     *
     * @type {number}
     * @memberof Shard
     */
    readonly id: number;
    /**
     * Connects the shard and core
     *
     * @returns {Promise<void>}
     * @memberof Shard
     */
    connect(): Promise<void>;
    /**
     * Loads the core (if not loaded)
     *
     * @returns {Promise<Core>}
     * @memberof Shard
     */
    loadCore(): Promise<Core>;
    /**
     * Unloads the core (if loaded)
     *
     * @returns {Promise<Core>}
     * @memberof Shard
     */
    unloadCore(): Promise<Core>;
    /**
     * Reloads the core
     *
     * @returns {Promise<Core>}
     * @memberof Shard
     */
    reloadCore(): Promise<Core>;
}
