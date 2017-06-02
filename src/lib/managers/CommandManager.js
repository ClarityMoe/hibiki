const Manager = require('./Manager.js');
//const TestCtx = require('../structures/TestCtx.js');
const Ctx = require('../structures/Ctx.js');
const rreaddir = require('recursive-readdir');
const exec = require('child_process').exec;
const minimist = require('minimist');
const fs = require('fs');

class CommandManager extends Manager {
    constructor(client, options) {
        super(client, options);
        this.commandDir = options.commandDir;
        this.commands = {};
        this.aliases = {};
        this.cooldowns = {};
        this.__base = options.__base;
    }

    unload(name) {
        return new Promise((resolve, reject) => {
            if (!this.commands.hasOwnProperty(name)) return reject(new Error(`Command ${name} is not loaded`))
            resolve(delete this.commands[name]);
            this.client.emit('commandUnloaded', name);
        });
    }

    reload(name) {
        return new Promise((resolve, reject) => {
            this.unload(name)
                .catch(reject)
                .then(() => {
                    this.load(name)
                        .catch(reject)
                        .then(resolve);
                });
        });
    }

    load(name) {
        return new Promise((resolve, reject) => {
            rreaddir(`${process.cwd()}/${this.commandDir}`, (err, files) => {
                if (err) return reject(err);
                for (const file of files) {
                    if (!file.endsWith('package.json')) continue;
                    let cmd;
                    let pkg;
                    const nya = [];
                    try {
                        pkg = require(file);
                    } catch (e) {
                        this.logger.error(new Error(`${file}: couldn't load package: ${e}`));
                    }

                    if (pkg.name !== name) continue;

                    if (!pkg || !pkg.main || !fs.existsSync(file.replace('package.json', pkg.main) || !pkg.name || !pkg.description)) {
                        return reject(new Error(`${file}: invalid package.json`));
                    }

                    if (pkg.dependencies && Object.keys(pkg.dependencies)) {
                        for (const awau of Object.keys(pkg.dependencies)) {
                            try {
                                require.resolve(awau);
                            } catch (e) {
                                if (!nya.includes(awau)) nya.push(awau);
                            }
                        }
                        exec(`npm i ${nya.join(' ')}`, (err, stdout, stderr) => {
                            if (err) reject(new Error(`Error while installing packages: ${err}`));
                        });
                    }

                    if (this.commands.hasOwnProperty(pkg.name)) {
                        return reject(new Error(`Duplicate command: ${pkg.name} (${file})`));
                    }

                    try {
                        try {
                            delete require.cache[require.resolve(file.replace('package.json', pkg.main))];
                        } catch (e) { // Assume the module wasn't loaded before.
                        }
                        const Command = require(file.replace('package.json', pkg.main));
                        try {
                            cmd = new Command(this.client);
                        } catch (e) { // I assume you forgot to add module.exports.
                        }
                        if (!cmd) {
                            return reject(new Error(`Couldn't load command ${pkg.name}, did you forget to add module.exports?`));
                        }

                        if (!cmd.run) {
                            return reject(new Error(`Couldn't find the run function for command ${pkg.name}`));
                        }

                        cmd.path = file.replace('package.json', '');
                        cmd.main = pkg.main;
                        cmd.name = cmd.name || pkg.displayName || pkg.name;
                        cmd.cooldown = cmd.cooldown || 5000;
                        cmd.check = cmd.check || true;
                        cmd.version = cmd.version || pkg.version;
                        cmd.description = cmd.description || pkg.description;
                        cmd.contributors = cmd.contributors || pkg.contributors || [];
                        cmd.author = cmd.author || pkg.author && pkg.author.name || pkg.author || 'unknown';

                        if (cmd.check) {
                            if (cmd.run.toString().indexOf('eval') > -1 && !cmd.dev) {
                                return reject(new Error(`Run function for command ${cmd.name} contains an eval function, but it's not listed as dev command.\nYou can disable this check by adding \`this.check = false;\` to the command.`));
                            }
                            if (cmd.run.toString().indexOf('this.client.token') > -1 && !cmd.dev) {
                                return reject(new Error(`this.client.token :ThoughTs:`));
                            }
                        }

                        if (cmd.aliases.length > 0) {
                            for (const alias of cmd.aliases) {
                                if (!this.aliases.hasOwnProperty(alias)) {
                                    this.aliases[alias] = cmd.name;
                                }
                            }
                        }

                        this.commands[cmd.name] = cmd;
                        this.client.emit('commandLoaded', cmd.name, cmd);

                        //TODO: Complete TestCtx to test for memecode
                        //if (!cmd.cantTestThis) cmd.run(new TestCtx());
                    } catch (e) {
                        this.logger.error(`${file}:`, e);
                    }

                }
            })
        });
    }

    loadAll() {
        rreaddir(`${process.cwd()}/${this.commandDir}`, (err, files) => {
            if (err) return this.logger.error(err);
            for (const file of files) {
                if (!file.endsWith('package.json')) continue;
                let cmd;
                let pkg;
                const nya = [];
                try {
                    pkg = require(file);
                } catch (e) {
                    this.logger.error(`${file}: couldn't load package: ${e}`);
                }

                if (!pkg || !pkg.main || !fs.existsSync(file.replace('package.json', pkg.main) || !pkg.name || !pkg.description)) {
                    this.logger.error(`${file}: invalid package.json`);
                    continue
                };

                if (pkg.dependencies && Object.keys(pkg.dependencies)) {
                    for (const awau of Object.keys(pkg.dependencies)) {
                        try {
                            require.resolve(awau);
                        } catch (e) {
                            if (!nya.includes(awau)) nya.push(awau);
                        }
                    }
                    exec(`npm i ${nya.join(' ')}`, (err, stdout, stderr) => {
                        if (err) return this.logger.error(`Error while installing packages: ${err}`);
                        if (stderr) return this.logger.error(`Error while installing packages: ${stderr}`);
                    });
                }

                if (this.commands.hasOwnProperty(pkg.name)) {
                    this.logger.warn(`Duplicate command: ${pkg.name} (${file})`);
                    continue;
                }

                try {
                    try {
                        delete require.cache[require.resolve(file.replace('package.json', pkg.main))];
                    } catch (e) { // Assume the module wasn't loaded before.
                    }
                    const Command = require(file.replace('package.json', pkg.main));
                    try {
                        cmd = new Command(this.client);
                    } catch (e) { // I assume you forgot to add module.exports.
                    }
                    if (!cmd) {
                        this.logger.error(`Couldn't load command ${pkg.name}, did you forget to add module.exports?`);
                        continue;
                    }

                    if (!cmd.run) {
                        this.logger.error(`Couldn't find the run function for command ${pkg.name}`);
                        continue;
                    }

                    cmd.path = file.replace('package.json', '');
                    cmd.main = pkg.main;
                    cmd.name = cmd.name || pkg.name;
                    cmd.cooldown = cmd.cooldown || 5000;
                    cmd.check = cmd.check || true;
                    cmd.version = cmd.version || pkg.version;
                    cmd.description = cmd.description || pkg.description;
                    cmd.contributors = cmd.contributors || pkg.contributors || [];
                    cmd.author = cmd.author || pkg.author && pkg.author.name || pkg.author || 'unknown';
                    cmd.private = cmd.private || pkg.private || false;
                    cmd.hidden = cmd.hidden || pkg.hidden || false;
                    cmd.category = cmd.category || pkg.category;

                    if (cmd.check) {
                        if (cmd.run.toString().indexOf('eval') > -1 && !cmd.dev) {
                            this.logger.error(`Run function for command ${cmd.name} contains an eval function, but it's not listed as dev command.\nYou can disable this check by adding \`this.check = false;\` to the command.`);
                            continue;
                        }
                        if (cmd.run.toString().indexOf('this.client.token') > -1 && !cmd.dev) {
                            this.logger.error(`this.client.token :ThoughTs:`);
                            continue
                        }
                    }

                    if (cmd.aliases.length > 0) {
                        for (const alias of cmd.aliases) {
                            if (!this.aliases.hasOwnProperty(alias)) {
                                this.aliases[alias] = cmd.name;
                            }
                        }
                    }

                    this.commands[cmd.name] = cmd;
                    this.client.emit('commandLoaded', cmd.name, cmd);

                    //TODO: Complete TestCtx to test for memecode
                    //if (!cmd.cantTestThis) cmd.run(new TestCtx());
                } catch (e) {
                    this.logger.error(`${file}:`, e);
                }
            }
        });
    }

    async check(msg) {
        let guild;
        let user;
        let prefix;

        // TODO: Do database stuff later
        if (msg.channel.guild) {
            try {
                guild = await this.db.getGuild(msg.channel.guild.id);
            } catch (e) {
                try {
                    guild = this.cache.get(`guild_${msg.channel.guild.id}`);
                } catch (e) {
                    this.logger.error(e);
                }
            }
        }

        try {
            user = await this.db.getUser(msg.author.id);
            this.db.cache.set(`user_${msg.author.id}`, await user);
        } catch (e) {
            try {
                user = this.cache.get(`user_${msg.author.id}`);
            } catch (e) {
                this.logger.error(e);
            }
        }

        for (const p of this.config.prefixes) {
            if (msg.content.startsWith(p)) prefix = p;
        }

        if (!prefix && guild && guild.prefixes) {
            for (const p of guild.prefixes) {
                if (msg.content.startsWith(p)) prefix = p;
            }
        }

        if (!prefix) return;

        const cmd = msg.content.substring(prefix.length).split(" ")[0];

        if (this.commands.hasOwnProperty(cmd)) this.run(msg, prefix, this.commands[cmd]);
        else if (this.aliases.hasOwnProperty(cmd)) this.run(msg, prefix, this.commands[this.aliases[cmd]]);
    }

    help(msg, prefix, cmd) {
        const args = [];
        for (const arg of Object.keys(cmd.arguments)) {
            args.push(cmd.arguments[arg].required ? `<${arg}>` : `[${arg}]`);
        }

        const fields = [
            {
                name: 'Usage',
                inline: false,
                value: `\`${prefix}${cmd.name} ${args.join(' ')}\``
            }
        ]

        msg.channel.createMessage({
            embed: {
                title: cmd.name,
                description: cmd.description,
                fields: fields
            }
        });

    }

    run(msg, prefix, cmd, b) {
        const a = msg.content.substring(prefix.length);
        const suffix = a.substring((b && b.length || cmd.name.length) + 1);
        const argv = minimist(suffix.split(" "));
        const args = argv._;

        if (cmd.subcommands.hasOwnProperty(args[0])) {
            cmd.subcommands[args[0]].name = cmd.name;
            return this.run(msg, prefix, cmd.subcommands[args[0]], `${cmd.name} ${args[0]}`);
        }

        if (!this.cooldowns.hasOwnProperty(msg.author.id)) this.cooldowns[msg.author.id] = {};

        if (!this.config.admins.includes(msg.author.id) && this.cooldowns[msg.author.id].hasOwnProperty(cmd.name) && Date.now() - this.cooldowns[msg.author.id][cmd.name].date < this.cooldowns[msg.author.id][cmd.name].time) {
            return this.db.getUser(msg.author.id).then(u => msg.channel.createMessage(this.lm.l(u.lang || 'en', ['commands', 'cooldown'], {
                username: msg.author.username,
                time: (this.cooldowns[msg.author.id][cmd.name].time - (Date.now() - this.cooldowns[msg.author.id][cmd.name].date)) / 1000
            })).catch(this.logger.error)).catch(this.logger.error);
        }

        if (!this.config.admins.includes(msg.author.id)) {
            this.cooldowns[msg.author.id][cmd.name] = {
                date: Date.now(),
                time: cmd.cooldown
            }
        }

        this.logger.message(msg);

        if (!cmd.ignoreFlags) if (argv.h || argv.help) return this.help(msg, prefix, cmd);

        if (cmd.dev && !this.config.admins.includes(msg.author.id)) return;

        this.db.getUser(msg.author.id).then(u => {
            cmd.run(new Ctx(this.client, msg, {
                prefix: prefix,
                command: cmd.name,
                args: args,
                argv: argv,
                suffix: suffix,
                user: u
            }));
        }).catch(this.logger.error);

    }

}

module.exports = CommandManager;