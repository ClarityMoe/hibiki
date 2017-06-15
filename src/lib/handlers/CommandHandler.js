const Handler = require('./Handler.js');
const Ctx = require('../structures/Ctx.js');
const minimist = require('minimist');

/**
 * Command Handler
 * 
 * @class CommandHandler
 * @extends Hibiki#Handler
 */

class CommandHandler extends Handler {

    /**
     * Creates an instance of CommandHandler.
     * @param {Hibiki?} client Hibiki client
     * @param {Object} opt Hibiki options
     * 
     * @memberof CommandHandler
     */
    constructor(client, opt) {
        super(client, opt);
        this.cooldowns = {};
    }

    /**
     * Check if a message can execute a command
     * 
     * @param {Message?} msg Message to check
     * @returns 
     * 
     * @memberof CommandHandler
     */
    async check(msg) {
        let guild;
        let user;
        let prefix;

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

        if (this.cm.hasCommand(cmd)) {
            this.db.getGuild(msg.channel.guild.id).then(g => this.db.getUser(msg.author.id).then(u => {
                this.run({
                    guild: g,
                    user: u
                }, msg, prefix, this.cm.aliases.hasOwnProperty(cmd) && this.cm.aliases[cmd] || cmd, this.cm.get(cmd));
            }));
        }
    }

    /**
     * Executes a command.
     * 
     * @param {Message?} msg Message which was used to execute the command
     * @param {String} prefix Prefix which was used to execute the command
     * @param {String} ec Command which was used to execute the command (in case of aliases)
     * @param {Object} command Cog of the command
     * @returns 
     * 
     * @memberof CommandHandler
     */

    run(opt, msg, prefix, ec, command, b, cog) {

        if (this.config.beta && !this.config.admins.includes(msg.author.id)) return; // We don't want other people to use our bot in beta!

        for (const name of Object.keys(this.cm.scripts)) {
            const script = this.cm.scripts[name];
            switch (script.type) { // If we can use scripts, USE THEM!
                case 'middleware':
                case 'commandMiddleware':
                case 'command_middleware':
                case 'cmdMiddleware':
                case 'cmd_middleware': { // Check if we can use middleware from the scripts
                    script.middleware(msg, {
                        command: command,
                        prefix: prefix
                    }).catch(this.logger.error);
                    break;
                }
                default: {
                    break; // Script type can't be used here
                }
            }
        }

        cog = cog || command.hasOwnProperty('command') && command;
        const cmd = command.hasOwnProperty('command') && command.command || command;

        const a = msg.content.substring(prefix.length);
        const suffix = a.substring((b && b.length || ec.length) + 1);
        const argv = minimist(suffix.split(" "));
        const args = argv._;

        if (cmd.subcommands.hasOwnProperty(args[0])) {
            if (!cmd.subcommands[args[0]].hasOwnProperty('name')) cmd.subcommands[args[0]].name = args[0];
            return this.run(opt, msg, prefix, ec, cmd.subcommands[args[0]], `${ec} ${args[0]}`, command);
        }

        if (!this.cooldowns.hasOwnProperty(msg.author.id)) this.cooldowns[msg.author.id] = {};

        if (!this.config.admins.includes(msg.author.id) && this.cooldowns[msg.author.id].hasOwnProperty(command.name) && Date.now() - this.cooldowns[msg.author.id][command.name].date < this.cooldowns[msg.author.id][command.name].time) {
            return this.db.getUser(msg.author.id).then(u => msg.channel.createMessage(this.lm.l(u.lang || 'en', ['commands', 'cooldown'], {
                username: msg.author.username,
                time: (this.cooldowns[msg.author.id][command.name].time - (Date.now() - this.cooldowns[msg.author.id][command.name].date)) / 1000
            })).catch(this.logger.error)).catch(this.logger.error);
        }

        if (!this.config.admins.includes(msg.author.id)) {
            this.cooldowns[msg.author.id][command.name] = {
                date: Date.now(),
                time: cmd.cooldown
            }
        }

        this.logger.message(msg);

        if (!cmd.ignoreFlags) if (argv.h || argv.help) return this.help(msg, prefix, cog);

        if (cmd.dev && !this.config.admins.includes(msg.author.id)) return; // lol

        if (cmd.permissions.length > 0 && !msg.channel.permissionsOf(msg.author.id).has('manageGuild') && !msg.channel.permissionsOf(msg.author.id).has('administrator')) {
            for (const permission of cmd.permissions) {
                if (!msg.channel.permissionsOf(msg.author.id).has(permission)) return;
            }
        }

        if (cmd.botPermissions.length > 0 && !msg.channel.permissionsOf(msg.author.id).has('administrator')) {
            for (const permission of cmd.botPermissions) {
                if (!msg.channel.permissionsOf(msg.author.id).has(permission)) return;
            }
        }

        if (Object.keys(cmd.arguments).length > 0) {
            for (const name of Object.keys(cmd.arguments)) {
                const arg = cmd.arguments[name];
                if (arg.required && !args[Object.keys(cmd.arguments).indexOf(name)]) return this.db.getUser(msg.author.id).then(u => msg.channel.createMessage(this.client.lm.l(u.lang || 'en', ['commands','argument_not_specified'], {
                    username: msg.author.username,
                    argument: name
                }))).catch(this.logger.error);
            }
        } 

        const ctx = new Ctx(this.client, msg, {
            prefix: prefix,
            command: cmd,
            cog: command,
            args: args,
            argv: argv,
            suffix: suffix,
            user: opt.user,
            guild: opt.guild
        })

        cmd.run(ctx).catch(e => ctx.createError(e)).then(c => ctx.createMessage(c));
    }

    help(msg, prefix, cog) {
        const cmd = cog.command;
        const aliases = [];
        for (const alias of Object.keys(this.cm.aliases)) if (this.cm.aliases[alias] === cog.name) aliases.push(alias);

        const args = [];
        for (const arg of Object.keys(cmd.arguments)) {
            args.push(cmd.arguments[arg].required ? `<${arg}>` : `[${arg}]`);
        }

        const fields = [
            {
                name: 'Usage',
                inline: false,
                value: `\`${prefix}${cog.name} ${args.join(' ')}\``
            }
        ];

        if (aliases.length > 0) {
            fields.push({
                name: 'Aliases',
                inline: true,
                value: `${aliases.join('\n')}`
            });
        }

        msg.channel.createMessage({
            embed: {
                title: cog.name,
                description: cog.description,
                fields: fields
            }
        });
    }
}

module.exports = CommandHandler;