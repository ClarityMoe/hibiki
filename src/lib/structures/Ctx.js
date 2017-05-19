const Message = require('./Message.js');

class Ctx extends Message {
    constructor(client, msg, options) {
        super(msg.data, client);
        this.options = options;
        this.prefix = options.prefix;
        this.command = options.command;
    }

    createMessage(content, options, mOptions) {
        mOptions = mOptions || {};
        if (!mOptions.channel) return this.channel.createMessage(content, options).catch(this.createError);
        else if (mOptions.channel) if (this._client.)
    }

}

module.exports = Ctx;
