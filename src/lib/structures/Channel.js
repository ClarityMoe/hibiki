const Eris = require('eris');

class Channel extends Eris.Channel {
    constructor(data) {
        super(data);
    }
}

module.exports = Channel;