const numeral = require('numeral');

class NowPlaying extends Command {
    constructor(client) {
        super(client);
        this.aliases = [
            "np"
        ]
    }

    run(ctx) {
        return new Promise(async (resolve) => {
            const p = this.bot.players.get(ctx.guild.id);
            resolve(p && p.current && {
                embed: {
                    title: `${p.current.title} [${numeral(p.current.duration - p.timeLeft).format('00:00:00')}/${numeral(p.current.duration).format('00:00:00')}]`,
                    description: `**Next:** ${await ctx.player.getNext() || 'None'}`,
                    image: {
                        url: p.current.thumbnail
                    },
                    footer: {
                        text: `Requested by: ${this.bot.users.get(p.current.user).tag}`
                    }
                }
            } || "Playing nothing!")
        })
    }

}

module.exports = NowPlaying;