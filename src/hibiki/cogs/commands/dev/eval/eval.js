const exec = require('child_process').exec;
const util = require('util');
const got = require('got');

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
        return new Promise((resolve) => {
            const pyctx = `{ 'id': '${ctx.id}', 'content': '${ctx.content.replace(/'/g, "\\'").replace(/"/g, '\\"')}', 'mentions': ${util.inspect(ctx.mentions.map(u => u.id))}, 'reactions': ${util.inspect(ctx.reactions)}, 'attachments': ${util.inspect(ctx.attachments) }, 'guild': { 'id': '${ctx.channel.guild.id}' }, 'channel': { 'id': '${ctx.channel.id}' }, 'author': { 'discriminator': '${ctx.author.discriminator}', 'username': '${ctx.author.username}', 'id': '${ctx.author.id}' }, 'member': { 'id': '${ctx.member.id}' } }`
            exec(`python -c "ctx = ${pyctx}; ${ctx.suffix.replace(/"/g, '\\"')}"`, (err, stdout, stderr) => {
                if (stderr) return ctx.createCode('diff', `- ${stderr}`);
                if (stdout.length > 1990) {
                    resolve('Output is longer than 2000 characters, please check console for output.');
                } else return ctx.createCode('py', stdout);
            });
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
        return new Promise(async (resolve) => {
            try {
                const ev = util.inspect(await eval(ctx.suffix), { depth: 0 });
                if (ev && ev.toString().length > 1990) {
                    resolve('Output is longer than 2000 characters, please check console for output.');
                    console.log(ev);
                } else ctx.createCode('js', ev)
            } catch(e) {
                ctx.createCode('diff', `- ${e.stack}`);
            }
        });
    }

}

module.exports = Eval;