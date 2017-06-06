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
            default: {
                return '❓';
            }
        }
    }

    create(content, file, opt) {
        opt = opt || {};
        opt.buttons = opt.buttons || {};
        return new Promise((resolve, reject) => {
            this.createMessage(content, file, opt.msg).then(m => {
                if (Object.keys(opt.buttons).length > 0) {
                    let i = 0;
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
                                can();
                            } else if (!button.toggle) {
                                if (msg.channel.guild && msg.channel.permissionsOf(this.client.user.id).has('manageMessages')) m.removeReaction(emote.id ? `${emote.name}:${emote.id}` : emote.name, id).catch(reject);
                                this.client.emit('buttonClick', msg, emote, id);
                            } else this.client.emit('buttonToggle', msg, emote, id, true);
                            
                            if (button.action) button.action(msg);
                        }

                        const rem = (msg, emote, id) => {
                            if (!button.toggle || id !== this.author.id || msg.id !== m.id || emote.id ? `${emote.name}:${emote.id}` !== emoji : emote.name !== emoji) return;
                            this.client.emit('buttonToggle', msg, emote, id, false);
                        }

                        const can = () => {
                            m.removeReactions().catch(reject);
                            this.client.removeListener('messageReactionAdd', add);
                            if (button.toggle) this.client.removeListener('messageReactionRemove', rem);
                        }

                        const to = setTimeout(() => {
                            can();
                            if (opt.buttonTimeoutAction) opt.buttonTimeoutAction(m);
                        }, Number(opt.buttonTimeout) !== NaN && Number(opt.buttonTimeout) || 10000)

                        this.client.on('messageReactionAdd', add);
                        if (button.toggle) this.client.on('messageReactionRemove', rem);
                    }

                    next(Object.keys(opt.buttons)[i]);

                }

                resolve(m);
            }).catch(reject);
        });
    }

    send(content, options, mOptions) {
        return this.createMessage(content, options, mOptions);
    }

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

    createCode(lang, content, options, mOptions) {
        mOptions = mOptions || {};
        if (mOptions.channel) return this._client.getChannel(mOptions.channel) ? this._client.getChannel(mOptions.channel).createMessage(`\`\`\`${lang}\n${content}\`\`\``, options).catch(e => this.createError(e)) : Promise.reject(new Error("Channel not found"));
        else return this.channel.createMessage(`\`\`\`${lang}\n${content}\`\`\``, options).catch(e => this.createError(e));
    }

    createError(err) {
        return this.channel.createMessage(this.client.lm.l(this.db.user.lang || 'en', ['error', 'error'], {
            err: err.stack || err
        })).catch(this._client.logger.error);
    }

}

module.exports = Ctx;
