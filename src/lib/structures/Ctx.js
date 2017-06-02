const Message = require('./Message.js');

class Ctx extends Message {
    constructor(client, msg, options) {
        super(msg.data, client);
        this.client = client;
        this.options = options;
        this.user = options.user;
        this.prefix = options.prefix;
        this.command = options.command;
        this.argv = options.argv;
        this.args = options.args;
        this.msg = msg;
        this.suffix = options.suffix;
    }

    createMessage(content, options, mOptions) {
        mOptions = mOptions || {};
        if (mOptions.channel) return this._client.getChannel(mOptions.channel) ? this._client.getChannel(mOptions.channel).createMessage(content, options).catch(this.createError) : Promise.reject(new Error("Channel not found"));
        else return this.channel.createMessage(content, options).catch(this.createError);
    }

    createCode(lang, content, options, mOptions) {
        mOptions = mOptions || {};
        if (mOptions.channel) return this._client.getChannel(mOptions.channel) ? this._client.getChannel(mOptions.channel).createMessage(`\`\`\`${lang}\n${content}\`\`\``, options).catch(this.createError) : Promise.reject(new Error("Channel not found"));
        else return this.channel.createMessage(`\`\`\`${lang}\n${content}\`\`\``, options).catch(this.createError);
    }

    createError(content, options, mOptions) {
        mOptions = mOptions || {};
        if (mOptions.channel) return this._client.getChannel(mOptions.channel) ? this._client.getChannel(mOptions.channel).createMessage(`\`\`\`diff\n- ${content}\`\`\``, options).catch(this._client.logger.error) : Promise.reject(new Error("Channel not found"));
        else return this.channel.createMessage(this.client.lm.l(this.user.lang || 'en', ['error','error'], {
            err: content
        }), options).catch(this._client.logger.error);
    }

}

module.exports = Ctx;
