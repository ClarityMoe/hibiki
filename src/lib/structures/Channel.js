const Eris = require('eris');

class Channel extends Eris.Channel {
    constructor(data) {
        super(data);
    }

    createError(content, file) {
        return this.createMessage(content, file).catch(console.error);
    }
}

module.exports = Channel;