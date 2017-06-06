class Help extends Command {
    constructor(client) {
        super(client);
        this.row = 0;
        this.buttons.up = {
            emoji: '⬆',
            description: 'Moves the cursor up',
            action: (m) => {
                this.row--;
                this.emit('change', this.row)
            }
        }
        this.buttons.down = {
            emoji: '⬇',
            description: 'Moves the cursor down',
            action: (m) => {
                this.row++;
                this.emit('change', this.row);
            }
        }
    }

    run(ctx) { 
        return new Promise((resolve, reject) => {

            ctx.send(this.lm.l(ctx.user.lang, ['commands', 'help_message'], {
                username: ctx.author.username
            }))

            const categories = {};

            for (const name of Object.keys(this.cm.commandCogs)) {
                const cog = this.cm.cogs[name];
                if (cog.hidden) continue;
                if (!categories.hasOwnProperty(cog.category)) categories[cog.category] = {};
                categories[cog.category][name] = cog;
            }

            const msgs = {};

            for (const category of Object.keys(categories)) {
                if (!msgs.hasOwnProperty(category)) msgs[category] = [];
                for (const cmd of Object.keys(categories[category])) {
                    const cog = categories[category][cmd];
                    if (!msgs.hasOwnProperty(cog.name)) msgs[category].push(`${cog.name}${' '.repeat(20 - cog.name.length)}=> ${cog.description}`);
                }
            }

            const pages = [];

            for (const category of Object.keys(msgs)) {
                const cmds = msgs[category];
                pages.push({
                    embed: {
                        title: category.charAt(0).toLocaleUpperCase() + category.toLocaleLowerCase().slice(1),
                        description: `\`\`\`fix\n${cmds.join('\n')}\`\`\``,
                        footer: {
                            text: `[${Object.keys(msgs).indexOf(category) + 1}/${Object.keys(msgs).length}]`
                        }
                    }
                });
            }

            let page = 0;

            ctx.create(pages[page], null, pages.length > 1 && {
                buttons: {
                    left: {
                        action: (msg) => {
                            if (page !== 0) msg.edit(pages[--page])
                        }
                    },
                    right: {
                        action: (msg) => {
                            if (page !== pages.length - 1) msg.edit(pages[++page])
                        }
                    }
                },
                buttonTimeout: 60000,
                msg: {
                    channel: ctx.author.id
                }
            } || null).catch(reject);
        });
    }
}

module.exports = Help;