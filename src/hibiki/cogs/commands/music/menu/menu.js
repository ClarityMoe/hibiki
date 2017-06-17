class Menu extends Command {
    constructor(client) {
        super(client);
    }

    run(ctx) {
        return new Promise(async (resolve, reject) => {
            if (!ctx.player) return resolve('Not playing music here!');

            const updateMessage = async (msg) => {
                msg.edit({
                    embed: {
                        title: ctx.player.current.title,
                        description: `**Autoplay**: ${ctx.player.autoplay && 'on' || 'off'}\n**Repeat**: ${ctx.player.repeat && 'on' || 'off'}\n**Next**: ${await ctx.player.getNext() || 'None'}`,
                        footer: {
                            text: `Requested by: ${this.bot.users.get(ctx.player.current.user).tag}`
                        }
                    }
                });
            }

            ctx.create({
                embed: {
                    title: ctx.player.current.title,
                    description: `**Autoplay**: ${ctx.player.autoplay && 'on' || 'off'}\n**Repeat**: ${ctx.player.repeat && 'on' || 'off'}\n**Next**: ${await ctx.player.getNext() || 'None'}`,
                    footer: {
                        text: `Requested by: ${this.bot.users.get(ctx.player.current.user).tag}`
                    }
                }
            }, null, {
                buttonTimeout: 120000,
                buttons: {
                    cancel: {
                        action: (msg) => {
                            ctx.player.removeAllListeners('next')
                            ctx.player.menuOpen = false;
                        }
                    },
                    autoplay: {
                        emoji: '📺',
                        toggle: true,
                        action: (msg) => {
                            ctx.player.autoplay = !ctx.player.autoplay;
                            updateMessage(msg);
                        }
                    },
                    repeat: {
                        toggle: true,
                        action: (msg) => {
                            ctx.player.repeat = !ctx.player.repeat;
                            updateMessage(msg);
                        }
                    }
                }
            }).then(m => {
                this.bot.emit('musicMenuOpen', ctx);
                ctx.player.menuOpen = true;
                ctx.player.on('next', () => updateMessage(m));
            })
        })
    }
}

module.exports = Menu;