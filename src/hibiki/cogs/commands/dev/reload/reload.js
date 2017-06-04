class Reload extends Command {
    constructor(client) {
        super(client);
        this.arguments.cog = {
            required: true,
            pattern: null,
            description: 'Cog to reload'
        }
        this.dev = true;
    }

    run(ctx) {
        return new Promise((resolve, reject) => {
            if (!this.cm.has(ctx.suffix)) return ctx.createMessage(`Cog \`${ctx.suffix}\` not found`);
            this.cm.reload(ctx.suffix).then(res => {
                ctx.createMessage(`Reloaded \`${ctx.suffix}\`. Errors: \`${res.errors.length}\` `);
            }).catch(err => {
                ctx.createMessage(`Failed to reload \`${ctx.suffix}\`:\n\`\`\`diff\n- ${err}\`\`\``)
            });
        });
    }

}

module.exports = Reload;