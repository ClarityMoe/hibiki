const { Command } = require('../../../../../');

class Ping extends Command {
    constructor(client) {
        super(client);
    }

    run(ctx) {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            ctx.createMessage(`Pong!`).then(m => m.edit(`Pong! \`${Date.now() - now}ms\``)).catch(reject);
        });
    }
}

module.exports = Ping;