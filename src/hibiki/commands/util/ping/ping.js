const { Command } = require('../../../../../');

class Ping extends Command {
    constructor(client) {
        super(client);
    }

    run(ctx) {
        const now = Date.now();
        ctx.createMessage(`Pong!`).then(m => m.edit(`Pong! \`${Date.now() - now}ms\``));
    }
}

module.exports = Ping;