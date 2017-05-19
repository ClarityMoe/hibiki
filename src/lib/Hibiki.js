global.Promise = require('bluebird');

const Eris = require('eris');
const CommandManager = require('./managers/CommandManager.js');
const DatabaseConnection = require('./structurs/DatabaseConnection.js');

class Hibiki extends Eris.Client {
    constructor(token, options, hOptions) {
        if (!hOptions) throw new Error("No options for the framework specified");
        super(token, options);
        this.hOptions = hOptions;
    }

    get activeVoiceConnections() {
        return this.voiceConnections.filter(c => c.playing);
    }

}

module.exports = Hibiki;