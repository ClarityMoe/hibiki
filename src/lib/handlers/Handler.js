const EventEmitter = require('eventemitter3');

/**
 * Handler base class
 * 
 * @class Handler
 * @extends EventEmitter
 */

class Handler extends EventEmitter {

    /**
     * Creates an instance of Handler.
     * @param {Hibiki?} client Hibiki client
     * @param {Object} options Hibiki options
     * 
     * @memberof Handler
     */
    constructor(client, options) {
        super();
        this.client = client;
        this.config = client.config
        this.options = options;
        this.db = client.db;
        this.cm = client.cm;
        this.lm = client.lm;
        this.ch = client.ch;
        this.logger = client.logger;
        this.cache = client.cache;
    }
}

module.exports = Handler;