const Eris = require('eris');
const Channel = require('./Channel.js');

class Message extends Eris.Message {
    constructor (data, client) {
        super(data, client);
        this.data = data;
    }

    get guild() {
        return this.channel.guild;
    }
}

module.exports = Message;