const EventEmitter = require('eventemitter3');

class Manager extends EventEmitter {
    constructor(client, options) {
        super();
        this.client = client;
        this.options = options;
        this.db = client.db;
        this.logger = client.logger;
    }
}

module.exports = Manager;