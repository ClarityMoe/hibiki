const Message = require('./Message.js');
const minimist = require('minimist');

class Ctx extends Message {
    constructor(client, msg, options) {
        super(msg.data, client);
        this.client = client;
        this.options = options;
        this.prefix = options.prefix;
        this.command = options.command;
        this.argv = minimist(msg.content.substring(this.prefix.length).split(" ").slice(1).split(/\s+/));
        this.args = this.argv._;
    }

    createMessage(content, options, mOptions) {
        mOptions = mOptions || {};
        if (mOptions.channel) return this._client.getChannel(mOptions.channel) ? this._client.getChannel(mOptions.channel).createMessage(content, options).catch(this.createError) : Promise.reject(new Error("Channel not found"));
        else return this.channel.createMessage(content, options).catch(this.createError);
    }

    createError(content, options, mOptions) {
        mOptions = mOptions || {};
        if (mOptions.channel) return this._client.getChannel(mOptions.channel) ? this._client.getChannel(mOptions.channel).createMessage(content, options).catch(this._client.logger.error) : Promise.reject(new Error("Channel not found"));
        else return this.channel.createMessage(content, options).catch(this._client.logger.error);
    }

}

module.exports = Ctx;
