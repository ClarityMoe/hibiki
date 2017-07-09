const Message = require('./Message.js');

class Ctx extends Message {
    constructor(client, msg, options) {
        super(msg.data, client);
        this.client = client;
        this.options = options;
        this.cog = options.cog;
        this.db = {
            user: options.user,
            guild: options.guild
        }
        this.prefix = options.prefix;
        this.command = options.command;
        this.argv = options.argv;
        this.args = options.args;
        this.msg = msg;
        this.suffix = options.suffix;
        this.player = client.players.get(this.guild.id);
    }

    emoji(name) {
        switch (name) {
            case 'up':
            case 'arrowup':
            case 'arrow_up':
            case 'uparrow':
            case 'up_arrow': {
                return '⬆';
            }
            case 'down':
            case 'arrowdown':
            case 'arrow_down':
            case 'downarrow':
            case 'down_arrow': {
                return '⬇';
            }
            case 'left':
            case 'arrowleft':
            case 'arrow_left':
            case 'leftarrow':
            case 'left_arrow': {
                return '⬅';
            }
            case 'right':
            case 'arrowright':
            case 'arrow_right':
            case 'rightarrow':
            case 'right_arrow': {
                return '➡';
            }
            case 'stop':
            case 'cancel':
            case 'itstimetostop': {
                return '⏹';
            }
            case 'ok':
            case 'confirm':
            case 'sure': {
                return '✅';
            }
            case 'youtried':
            case 'star': {
                return '⭐';
            }
            case 'loop':
            case 'repeat': {
                return '🔁';
            }
            case 'repeat_one':
            case 'repeat_once':
            case 'repeatOne':
            case 'repeatOnce':
            case 'repeat1': {
                return '🔂';
            }
            default: {
                return '❓';
            }
        }
    }

    /**
     * Creates a message, special attributes (like buttons) can be passed to the options
     * 
     * @param {String|Object} content 
     * @param {Object} [file]
     * @param {Object} [opt]
     * @returns {Promise<Message>}
     * 
     * @memberof Ctx
     */

    create(content, file, opt) {
        opt = opt || {};
        opt.buttons = opt.buttons || {};
        return new Promise((resolve, reject) => {
            this.createMessage(content, file, opt.msg).then(m => {
                if (Object.keys(opt.buttons).length > 0) {
                    let i = 0;

                    const to = setTimeout(() => {
                        if (opt.buttonTimeoutAction) opt.buttonTimeoutAction(m);
                        m.removeReactions().catch(reject);
                    }, Number(opt.buttonTimeout) !== NaN && Number(opt.buttonTimeout) || 10000)

                    const next = (name) => {

                        const button = opt.buttons[name];
                        let emoji = '❓';
                        if (button.emoji) emoji = button.emoji;
                        else emoji = this.emoji(name);

                        m.addReaction(emoji).catch(reject).then(() => Object.keys(opt.buttons)[i + 1] && next(Object.keys(opt.buttons)[++i]));

                        const add = (msg, emote, id) => {
                            if (id !== this.author.id || msg.id !== m.id || emote.id ? `${emote.name}:${emote.id}` !== emoji : emote.name !== emoji) return;

                            if (button.cancel || button.confirm || button.end || name === 'cancel' || name === 'confirm') {
                                clearTimeout(to);
                                this.client.emit('buttonStop', msg);
                            } else if (!button.toggle) {
                                if (msg.channel.guild && msg.channel.permissionsOf(this.client.user.id).has('manageMessages')) m.removeReaction(emote.id ? `${emote.name}:${emote.id}` : emote.name, id).catch(reject);
                                this.client.emit('buttonClick', msg, emote, id);
                            } else this.client.emit('buttonToggle', msg, emote, id, true);

                            if (button.action) button.action(msg);
                        }

                        this.client.on('buttonStop', msg => {
                            if (msg.id === m.id) can();
                        })

                        const rem = (msg, emote, id) => {
                            if (!button.toggle || id !== this.author.id || msg.id !== m.id || emote.id ? `${emote.name}:${emote.id}` !== emoji : emote.name !== emoji) return;
                            this.client.emit('buttonToggle', msg, emote, id, false);
                            if (button.action) button.action(msg);
                        }

                        const can = () => {
                            m.removeReactions().catch(reject);
                            this.client.removeListener('messageReactionAdd', add);
                            if (button.toggle) this.client.removeListener('messageReactionRemove', rem);
                        }

                        this.client.on('messageReactionAdd', add);
                        if (button.toggle) this.client.on('messageReactionRemove', rem);
                    }

                    next(Object.keys(opt.buttons)[i]);

                }

                resolve(m);
            }).catch(reject);
        });
    }

    /**
     * @alias Ctx#createMessage
     * 
     * @param {String|Object} content Content to send
     * @param {Object} [file] File to send
     * @param {Object} [mOptions] Options to pass to the function
     * @returns {Promise<Message>}
     * 
     * @memberof Ctx
     */

    send(content, options, mOptions) {
        return this.createMessage(content, options, mOptions);
    }

    /**
     * Sends a message to the channel the command was executed in (or to the channel specified in options)
     * 
     * @param {String|Object} content Content to send
     * @param {Object} [file] File to send
     * @param {Object} [mOptions] Options to pass to the function
     * @returns {Promise<Message>}
     * 
     * @memberof Ctx
     */

    createMessage(content, file, mOptions) {
        mOptions = mOptions || {};
        if (mOptions.channel) {

            return this._client.getChannel(mOptions.channel) ?
                this._client.getChannel(mOptions.channel).createMessage(content, file).catch(e => this.createError(e)) :
                this._client.users.get(mOptions.channel) ?
                    this._client.users.get(mOptions.channel).createMessage(content, file).catch(e => this.createError(e)) :
                    Promise.reject(new Error("Channel not found"));

        } else return this.channel.createMessage(content, file).catch(e => this.createError(e));
    }

    /**
     * Sends a codeblock to the channel the command was executed in (or to the channel specified in options)
     * 
     * @param {String} [lang] Code language for the block
     * @param {String} content Code to send
     * @param {Object} [file] File to send
     * @param {Object} [mOptions] Options to pass to the function
     * @returns {Promise<Message>}
     * 
     * @memberof Ctx
     */

    createCode(lang, content, options, mOptions) {
        mOptions = mOptions || {};
        if (mOptions.channel) return this._client.getChannel(mOptions.channel) ? this._client.getChannel(mOptions.channel).createMessage(`\`\`\`${lang}\n${content}\`\`\``, options).catch(e => this.createError(e)) : Promise.reject(new Error("Channel not found"));
        else return this.channel.createMessage(`\`\`\`${lang}\n${content}\`\`\``, options).catch(e => this.createError(e));
    }

    /**
     * Sends an error message to the channel the command was executed in
     * 
     * @param {String|Error?} err
     * @returns {Promise<Message>}
     * 
     * @memberof Ctx
     */

    createError(err) {
        return this.channel.createMessage(this.client.lm.l(this.db.user.lang || 'en', ['error', 'error'], {
            err: err.stack || err
        })).catch(this._client.logger.error);
    }

}

module.exports = Ctx;
