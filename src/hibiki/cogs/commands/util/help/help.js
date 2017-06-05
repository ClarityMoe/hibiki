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

    /** @todo do this once reaction buttons work kthx */
    /* eslint-disable no-unused-vars */
    run(ctx) { 
        return new Promise((resolve, reject) => {

            /*ctx.createMessage(this.lm.l(ctx.user.lang, ['commands', 'help_message'], {
                username: ctx.author.username
            }))

            const categories = {};

            for (const name of Object.keys(this.cm.commandCogs)) {
                const cog = this.cm.cogs[name];
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

            this.on('change', (row) => {
                if (row === Object.keys(categories).length + 1) this.row = 0;
                if (row === -1) this.row = Object.keys(categories).length;

                ctx.createMessage(row);

                //this.emit('change');
            });*/

        });
    }
}

module.exports = Help;