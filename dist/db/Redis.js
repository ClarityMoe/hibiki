"use strict";
// Redis.ts - Redis wrapper (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
/**
 * Redis wrapper
 *
 * @export
 * @class Redis
 */
class Redis {
    /**
     * Creates an instance of Redis.
     * @param {Shard} shard
     * @param {redis.ClientOpts} options
     * @memberof Redis
     */
    constructor(shard, options) {
        this.shard = shard;
        this.options = options;
    }
    /**
     * Connect to redis
     *
     * @returns {Promise<void>}
     * @memberof Redis
     */
    connect() {
        this.client = redis.createClient(this.options);
        return Promise.resolve();
    }
    /**
     * Set a key to an object
     *
     * @param {string} key
     * @param {object} value
     * @returns {Promise<any>}
     * @memberof Redis
     */
    set(key, value) {
        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }
    /**
     * Get a key
     *
     * @param {string} key
     * @returns {Promise<object>}
     * @memberof Redis
     */
    get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(JSON.parse(res));
            });
        });
    }
}
exports.Redis = Redis;
