const Manager = require('./Manager.js');
const TestCtx = require('../structures/TestCtx.js');
const rreaddir = require('recursive-readdir');
const bluebird = require('bluebird');

bluebird.promisify(rreaddir);

class CommandManager extends Manager {
    constructor(client, options) {
        super(client, options);
        this.commandDir = options.commandDir;
        this.commands = {};
        this.aliases = {};
    }

    loadAll() {
        rreaddir(this.commandDir).then(files => {
            for (const file of files) {
                if (!file.endsWith('.cmd.js')) return;
                let cmd;
                try {
                    cmd = require(file);

                    if (!cmd) throw new Error(`Couldn't load ${file}, did you forget to add module.exports?`);
                    if (!cmd.run) throw new Error(`Couldn't find the run function for ${file}`);
                    if (!cmd.name) cmd.name = file.substring(file.lastIndexOf('/')).split('.cmd.js')[0];
                    if (!cmd.cooldown) cmd.cooldown = 5000;
                    if (!cmd.checkRun) {
                        if (cmd.run.toString().indexOf('eval') > -1 && !cmd.dev) throw new Error(`Run function for command ${cmd.name} contains an eval function, but it's not listed as dev command.\nYou can disable this check by adding \`this.checkRun = false;\` to the command.`);
                        if (cmd.run.toString().indexOf('this.client.token') > -1 && !cmd.dev) throw new Error(`this.client.token :ThoughTs:`);
                    }


                    if (cmd.aliases.length > 0) for (const alias of cmd.aliases) this.aliases[alias] = cmd.name;

                    //TODO: Complete TestCtx to test for memecode
                    //if (!cmd.cantTestThis) cmd.run(new TestCtx());

                    this.commands[cmd.name] = cmd;
                } catch(e) {
                    this.logger.error(e);
                }
            }
        })
    }

    async check(msg) {
        let guild;
        let user;
        let prefix;

        if (msg.channel.guild) {
            try {
                guild = await this.db.getGuild(msg.channel.guild.id);
            } catch(e) {
                try {
                    guild = this.db.cache.get(`guild_${msg.channel.guild.id}`);
                } catch(e) {
                    this.logger.error(e);
                }
            }
        }

        try {
            user = await this.db.getUser(msg.author.id);
        } catch(e) {
            try {
                user = this.db.cache.get(`user_${msg.author.id}`);
            } catch(e) {
                this.logger.error(e);
            }
        }

        for (const p of this.config.prefixes) if (msg.content.startsWith(p)) { prefix = p; break; };
        if (!prefix && guild) for (const p of guild.prefixes) if (msg.content.startsWith(p)) { prefix = p; break; };
        if (!prefix) return;

        const cmd = msg.content.substring(prefix.length).split(" ")[0];



    }

    run(msg, prefix) {

    }

}

module.exports = CommandManager;