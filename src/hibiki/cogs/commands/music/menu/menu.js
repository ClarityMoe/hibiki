class Menu extends Command {
    constructor(client) {
        super(client);
    }

    run(ctx) {
        return new Promise((resolve, reject) => {
            const player = this.bot.players.get(ctx.guild.id);
            if (!player) return resolve('Not playing music here!');

            ctx.create({
                embed: {
                    title: player.current.title,
                    description: `**Repeat**: ${player.repeat && 'on' || 'off'}\n**Next**: ${ctx.db.guild.queue[1] || 'None'}`,
                    footer: {
                        text: `Requested by: ${this.bot.users.get(player.current.user).tag}`
                    }
                }
            }, null, {
                buttonTimeout: 120000,
                buttons: {
                    repeat: {
                        action: (msg) => {
                            player.repeat = true;
                            msg.edit({
                                embed: {
                                    title: player.current.title,
                                    description: `**Repeat**: ${player.repeat && 'on' || 'off'}\n**Next**: ${ctx.db.guild.queue[1]}`,
                                    footer: {
                                        text: `Requested by: ${this.bot.users.get(player.current.user).tag}`
                                    }
                                }
                            })
                        }
                    }
                }
            })
        })
    }
}

module.exports = Menu;