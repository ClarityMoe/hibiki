const EventEmitter = require('eventemitter3');

class Manager extends EventEmitter {
    constructor(client, options) {
        super();
        this.client = client;
        this.config = client.config
        this.options = options;
        this.db = client.db;
        this.cm = client.cm;
        this.lm = client.lm;
        this.logger = client.logger;
        this.cache = client.cache;
    }
}

module.exports = Manager;