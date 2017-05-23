const Eris = require('eris');

class PrivateChannel extends Eris.PrivateChannel {
    constructor(data, client) {
        super(data, client);
        this.data = data;
    }
}

module.exports = PrivateChannel;