const mongoose = require('mongoose');
const Eris = require('eris');
const EventEmitter = require('eventemitter3');

class DatabaseConnection extends EventEmitter {
    constructor(client, options) {
        super(client, options);
    }
}

module.exports = DatabaseConnection;