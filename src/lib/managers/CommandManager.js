const Manager = require('./Manager.js');
const TestCtx = require('../structures/TestCtx.js');
const rreaddir = require('recursive-readdir');
const bluebird = require('bluebird');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const fs = require('fs');

bluebird.promisify(rreaddir);
class CommandManager extends Manager {
    constructor(client, options) {
        super(client, options);
        this.commandDir = options.commandDir;
        this.commands = {};
        this.aliases = {};
    }

    loadAll() {
        rreaddir(this.commandDir, (err, files) => {
            if (err) return this.logger.error(err);
            for (const file of files) {
                if (!file.endsWith('package.json')) return;
                let cmd;
                const nya = [];
                const pkg = require(file);
                if (!pkg || !pkg.main || !fs.existsSync(file.replace('package.json', pkg.main) || !pkg.name)) return;
                if (pkg.dependencies && Object.keys(pkg.dependencies)) {
                    for (const awau of Object.kyes(pkg.dependencies)) try { require.resolve(awau) } catch (e) { if (!nya.includes(awau)) nya.push(awau) };
                    exec(`npm i ${nya.join(' ')}`, (err, stdout, stderr) => {
                        if (err) return this.logger.error(`Error while installing packages: ${err}`);
                        if (stderr) return this.logger.error(`Error while installing packages: ${stderr}`);
                    });
                }

                if (this.commands.hasOwnProperty(pkg.name)) return;

                try {
                    const Command = require(file.replace('package.json', pkg.main));
                    try {
                        cmd = new Command(this.client);
                    } catch(e) {
                        this.logger.error(`Error loading command ${pkg.name}: ${e}`);
                    }
                    cmd.name = cmd.name || pkg.name;
                    cmd.cooldown = cmd.cooldown || 5000;
                    cmd.check = cmd.check || true;
                    cmd.version = cmd.version || pkg.version;
                    if (!cmd) return this.logger.error(`Couldn't load command ${pkg.name}, did you forget to add module.exports?`);
                    if (!cmd.run) return this.logger.error(`Couldn't find the run function for command ${pkg.name}`);
                    if (cmd.check) {
                        if (cmd.run.toString().indexOf('eval') > -1 && !cmd.dev) return this.logger.error(`Run function for command ${cmd.name} contains an eval function, but it's not listed as dev command.\nYou can disable this check by adding \`this.check = false;\` to the command.`);
                        if (cmd.run.toString().indexOf('this.client.token') > -1 && !cmd.dev) return this.logger.error(`this.client.token :ThoughTs:`);
                    }

                    if (cmd.aliases.length > 0) for (const alias of cmd.aliases) if (!this.aliases.hasOwnProperty(alias)) this.aliases[alias] = cmd.name;

                    this.commands[cmd.name] = cmd;

                    //TODO: Complete TestCtx to test for memecode
                    //if (!cmd.cantTestThis) cmd.run(new TestCtx());

                    this.commands[cmd.name] = cmd;
                } catch (e) {
                    this.logger.error(e);
                }
            }
        });
    }

    async check(msg) {
        let guild;
        let user;
        let prefix;

        if (msg.channel.guild) {
            try {
                guild = await this.db.getGuild(msg.channel.guild.id);
            } catch (e) {
                try {
                    guild = this.db.cache.get(`guild_${msg.channel.guild.id}`);
                } catch (e) {
                    this.logger.error(e);
                }
            }
        }

        try {
            user = await this.db.getUser(msg.author.id);
        } catch (e) {
            try {
                user = this.db.cache.get(`user_${msg.author.id}`);
            } catch (e) {
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