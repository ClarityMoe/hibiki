const { Command } = require('../../../../../');
const config = require('../../../config.json');

class Eval extends Command {
    constructor(client) {
        super(client);
        this.dev = true;
    }

    run(ctx) {
        if (!ctx.user.dev && !config.admins.includes(ctx.author.id)) return;
        try {
            const ev = eval(ctx.suffix);
            if (ev.toString().length > 1990) {
                ctx.createMessage('Output is longer than 2000 characters, please check console for output.');
                console.log(ev);
            } else ctx.createCode('js', ev)
        } catch(e) {
            ctx.createError(e);
            this.logger.error('Eval error:', e);
        }
    }

}

module.exports = Eval;