const { Command } = require('../../../../../');
const exec = require('child_process').exec;

class Exec extends Command {
    constructor(client) {
        super(client);
        this.dev = true;
        this.arguments.command = {
            required: true,
            pattern: null,
            description: 'Command to execute'
        }
    }

    run(ctx) {
        exec(ctx.suffix, (err, out, stderr) => {
            if (stderr) return ctx.createCode('diff', `- ${stderr}`);
            return ctx.createCode('bash', out);
        });
    }
}

module.exports = Exec;