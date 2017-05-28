const { Command } = require('../../../../../');
const exec = require('child_process').exec;

class Python extends Command {
    constructor(client) {
        super(client);
        this.dev = true;
        this.arguments.code = {
            required: true,
            pattern: null,
            description: 'Code to execute (Py)'
        }
    }

    run(ctx) {
        exec(`python -c "${ctx.suffix}"`, (err, stdout, stderr) => {
            if (stderr) return ctx.createCode('diff', `- ${stderr}`);
            return ctx.createCode('py', stdout);
        });
    }
}

class Eval extends Command {
    constructor(client) {
        super(client);
        this.dev = true;
        this.arguments.code = {
            required: true,
            pattern: null,
            description: 'Code to execute (JS)'
        }
        this.subcommands.python = new Python(client);
    }

    run(ctx) {
        try {
            const ev = eval(ctx.suffix);
            if (ev && ev.toString().length > 1990) {
                ctx.createMessage('Output is longer than 2000 characters, please check console for output.');
                console.log(ev);
            } else ctx.createCode('js', ev)
        } catch(e) {
            ctx.createCode('diff', `- ${e}`);
        }
    }

}

module.exports = Eval;