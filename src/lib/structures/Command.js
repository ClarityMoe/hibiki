const EventEmitter = require('eventemitter3');

class Command extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.bot = client;
        this.db = client.db;
        this.logger = client.logger;

        this.cooldown = 10000;
        this.aliases = [];
        this.flags = {};
        this.arguments = {};
        this.buttons = {};

    }

    run (ctx) {

    }
}

module.exports = Command;