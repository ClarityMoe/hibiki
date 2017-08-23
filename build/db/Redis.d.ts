import * as redis from "redis";
import { Logger } from "../client/Logger";
/**
 * Redis wrapper
 *
 */
export declare class Redis {
    private options;
    /**
     * Redis client
     *
     * @private
     */
    private client;
    /**
     * Logger
     *
     */
    readonly logger: Logger;
    /**
     * Creates an instance of Redis.
     * @param {Shard} shard
     * @param {redis.ClientOpts} options
     */
    constructor(options: redis.ClientOpts);
    /**
     * Connect to redis
     *
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    /**
     * Disconnect from redis
     *
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
    /**
     * Set a key to an object
     *
     * @param {string} key
     * @param {object} value
     * @returns {Promise<any>}
     */
    set(key: string, value: object): Promise<any>;
    /**
     * Get a key
     *
     * @param {string} key
     * @returns {Promise<object>}
     */
    get(key: string): Promise<object>;
}
