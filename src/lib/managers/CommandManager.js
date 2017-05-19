const Eris = require('eris');
const Manager = require('./Manager.js');

class CommandManager extends Manager {
    constructor(client, options) {
        super(client, options);
    }

    check(msg) {

    }

    exec(msg, prefix) {

    }

}

module.exports = CommandManager;