class Play extends Command {
    constructor(client) {
        super(client);
    }

    run(ctx) {
        return new Promise((resolve, reject) => {
            new Promise((resolv, rejec) => {
                if (this.client.ytdl._ytv(ctx.suffix)) return this.client.ytdl.getInfo(ctx.suffix).then(resolv).catch(rejec);
                this.client.ytdl.search(ctx.suffix).then(res => {
                    const items = res.items.filter(item => item.id.kind === 'youtube#video');

                    new Promise((resol, reje) => {
                        if (items.length === 0) return reje(`No results`);
                        if (items.length === 1) return resolve(`https://youtube.com/watch?v=${items[0].id.videoId}`)
                        if (items.length > 1) {

                            const pages = [];

                            for (const item of items) {
                                pages.push({
                                    embed: {
                                        title: item.snippet.title,
                                        image: {
                                            url: item.snippet.thumbnails.medium.url
                                        },
                                        footer: {
                                            text: `[${items.indexOf(item) + 1}/${items.length}]`
                                        }
                                    }
                                })
                            }

                            let page = 0;
                            
                            ctx.create(pages[page], null, {
                                buttonTimeout: 60000,
                                buttonTimeoutAction: (msg) => {
                                    try {
                                        msg.edit(`\`Timed out...\`\n\n${msg.content}`);
                                        msg.removeReactions();
                                        reje(`Timed out`);
                                    } catch(e) {
                                    }
                                },
                                buttons: {
                                    left: {
                                        action: (msg) => {
                                            if (page === 0) return msg.edit(pages[page = pages.length - 1]);
                                            msg.edit(pages[--page]);
                                        }
                                    },
                                    cancel: {
                                        action: (msg) => msg.removeReactions().then(() => msg.delete())
                                    },
                                    confirm: {
                                        action: (msg) => resol(`https://youtube.com/watch?v=${items[page].id.videoId}`)
                                    },
                                    right: {
                                        action: (msg) => {
                                            if (page === pages.length - 1) return msg.edit(pages[page = 0]);
                                            msg.edit(pages[++page]);
                                        }
                                    }
                                }
                            })

                        }
                    }).catch(e => {
                        // do smthing with the error
                    }).then(url => this.client.ytdl.getInfo(url).then(resolv).catch(rejec)); // search promise
                }).catch(reject) // search
            }).then(info => { // info promise
                if (info.extractor === 'youtube' && info.is_live) return resolve(`Sorry **${ctx.author.username}**, but I can't play youtube livestreams (yet?)!`);
                
                if (!this.bot.players.has(ctx.guild.id)) this.bot.players.spawn(ctx);

                this.bot.players.get(ctx.guild.id).join(ctx.member.voiceState.channelID).then(() => {
                    this.bot.players.get(ctx.guild.id).enqueue(info, ctx.author.id).catch(reject).then(() => {
                        if (!this.bot.players.get(ctx.guild.id).playing) this.bot.players.get(ctx.guild.id).play();
                    });
                });

                

            }).catch(reject);
        });
    }

}

module.exports = Play;