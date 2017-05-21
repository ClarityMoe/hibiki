const Ctx = require('./Ctx.js');

class TestCtx extends Ctx {
    constructor(client, msg, options) {
        super(client, msg, options);

        //TODO: add member, author, channel, guild, etc

    }

    createMessage(content) {
        console.debug('createMessage =>', content);
    }

    createError(content) {
        console.debug('createError =>', content);
    }

}

module.exports = TestCtx;