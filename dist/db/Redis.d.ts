import * as redis from "redis";
/**
 * Redis wrapper
 *
 * @export
 * @class Redis
 */
export declare class Redis {
    private options;
    /**
     * Redis client
     *
     * @private
     * @type {redis.RedisClient}
     * @memberof Redis
     */
    private client;
    /**
     * Creates an instance of Redis.
     * @param {Shard} shard
     * @param {redis.ClientOpts} options
     * @memberof Redis
     */
    constructor(options: redis.ClientOpts);
    /**
     * Connect to redis
     *
     * @returns {Promise<void>}
     * @memberof Redis
     */
    connect(): Promise<void>;
    /**
     * Disconnect from redis
     *
     * @returns {Promise<void>}
     * @memberof Redis
     */
    disconnect(): Promise<void>;
    /**
     * Set a key to an object
     *
     * @param {string} key
     * @param {object} value
     * @returns {Promise<any>}
     * @memberof Redis
     */
    set(key: string, value: object): Promise<any>;
    /**
     * Get a key
     *
     * @param {string} key
     * @returns {Promise<object>}
     * @memberof Redis
     */
    get(key: string): Promise<object>;
}
