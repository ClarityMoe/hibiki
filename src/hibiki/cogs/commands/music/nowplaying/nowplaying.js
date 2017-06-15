const numeral = require('numeral');

class NowPlaying extends Command {
    constructor(client) {
        super(client);
        this.aliases = [
            "np"
        ]
    }

    run(ctx) {
        return new Promise((resolve, reject) => {
            const p = this.bot.players.get(ctx.guild.id);
            resolve({
                embed: {
                    title: `${p.current.title} [${numeral(p.current.duration - p.timeLeft).format('00:00:00')}/${numeral(p.current.duration).format('00:00:00')}]`,
                    description: `**Next:** ${ctx.db.guild.queue[1] && ctx.db.guild.queue[1].title || 'None'}`,
                    image: {
                        url: p.current.thumbnail
                    },
                    footer: {
                        text: `Requested by: ${this.bot.users.get(p.current.user).tag}`
                    }
                }
            })
        })
    }

}

module.exports = NowPlaying;