const { Command } = require('../../../../../');
const exec = require('child_process').exec;
const util = require('util');

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
        exec(`python -c "ctx = {'id': ${ctx.id},'content': '${ctx.content}','mentions': ${util.inspect(ctx.mentions.map(u => u.id))},'reactions': ${util.inspect(ctx.reactions)},'attachments': ${util.inspect(ctx.attachments)},'guild': {'id': ${ctx.channel.guild.id}},'channel': {'id': ${ctx.channel.id}},'author': {'discriminator': '${ctx.author.discriminator}', 'username': '${ctx.author.username}', 'id': ${ctx.author.id}},'member': {'id': ${ctx.member.id}}}; ${ctx.suffix}"`, (err, stdout, stderr) => {
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