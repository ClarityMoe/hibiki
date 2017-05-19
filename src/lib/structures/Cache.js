const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class Cache {
    constructor(...args) {
        this.client = redis.createClient(args)
    }

    async get(id) {
        return JSON.parse(await this.client.getAsync(id));
    }

    async set(id, val) {
        await this.client.setAsync(id, JSON.stringify(val));
        return this.client.expireAsync(id, 60 * 60);
    }

    async delete(id) {
        return this.client.delAsync(id);
    }

    async has(id) {
        return this.client.existsAsync(id);
    }

}

module.exports = Cache;