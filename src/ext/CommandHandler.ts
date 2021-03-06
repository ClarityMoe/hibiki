// CommandHandler.ts - Command handler (noud02)

import * as Eris from "eris";
import * as minimist from "minimist";
import * as pg from "pg";
import { Shard } from "../client/Shard";
import {
    Command,
    ICommandArg,
    ICommandPermission,
} from "./Command";
import { Context } from "./Context";
import { Ratelimiter } from "./Ratelimiter";

/**
 * Command handler class
 *
 * @export
 * @class CommandHandler
 */
export class CommandHandler {

    /**
     * Map of buckets
     *
     * @type {Map<string, Ratelimiter>}
     */
    public buckets: Map<string, Ratelimiter> = new Map<string, Ratelimiter>();

    constructor (private shard: Shard) {}

    /**
     * Initializes the command handler
     *
     * @returns {Promise<void>}
     */
    public init (): Promise<void> {
        // link the messageCreate event to checkMessage to check if the message is a command
        this.shard.on("messageCreate", (msg: Eris.Message) => this.checkMessage(msg).catch((e: Error) => this.shard.logger.debug(e.stack))); // tslint:disable-line:no-unused-expression

        return Promise.resolve();
    }

    /**
     * Check if a message is a command
     *
     * @param {Eris.Message} msg Message
     * @returns {Promise<void>}
     */
    public async checkMessage (msg: Eris.Message): Promise<void> {
        let guildPrefixes: string[] = [];
        let usedPrefix: string = "";
        let command: string = "";
        let args: minimist.ParsedArgs;

        if (msg.channel instanceof Eris.GuildChannel) {
            const res: pg.QueryResult = await this.shard.pg.select("guilds", `id = '${msg.channel.guild.id}'`);
            guildPrefixes = res.rows[0].prefixes;
        }

        if (msg.author.bot) {
            return;
        }

        if (guildPrefixes.length > 0) {
            for (const prefix of guildPrefixes) {
                if (!msg.content.startsWith(prefix)) {
                    continue;
                } else {
                    usedPrefix = prefix;
                    break;
                }
            }
        } else {
            for (const prefix of this.shard.hibikiOptions.hibiki.prefixes) {
                if (!msg.content.startsWith(prefix)) {
                    continue;
                } else {
                    usedPrefix = prefix;
                    break;
                }
            }
        }

        if (!usedPrefix) {
            return Promise.reject(new Error("Message not a command"));
        }

        command = msg.content.substring(usedPrefix.length).split(" ")[0];
        args = minimist(msg.content.substring(usedPrefix.length).split(" ").slice(1).join(" "), { strings: true });

        return this.executeCommand(msg, command, args, usedPrefix);
    }

    /**
     * Execute a command
     *
     * @param {Eris.Message} msg Message
     * @param {string} command Command name
     * @param {minimist.ParsedArgs} args Arguments
     * @param {string} prefix Prefix used
     * @returns {Promise<any>}
     */
    public async executeCommand (msg: Eris.Message, command: string, args: minimist.ParsedArgs, prefix: string): Promise<any> {
        let subcommand: string | undefined = undefined; // tslint:disable-line:no-unnecessary-initializer

        if (command.indexOf(".") > -1) {
            subcommand = command.split(".")[1];
            command = command.split(".")[0];
        }

        let cmd: Command | undefined = this.shard.ext.commands.get(command);

        if (subcommand && cmd) {
            cmd = cmd.subcommands[subcommand];
        }

        let bucket: Ratelimiter | undefined = this.buckets.get(msg.author.id);
        let ok: boolean = false;

        if (!cmd) {
            return Promise.reject(new Error(`Command ${command} not found`));
        }

        if (args._.length > 0 && cmd.subcommands && Object.keys(cmd.subcommands).indexOf(args._[0]) > -1) {
            const arg: string = args._[0];
            args._ = args._.slice(1);

            return this.executeCommand(msg, `${command}.${arg}`, args, prefix);
        }

        const useBucket: any = () => {
            if (bucket) {
                switch (bucket.use()) {
                    default:
                    case "OK": {
                        ok = true;
                        break;
                    }
                    case "RATELIMITED": {
                        const waitTime = (bucket.lastUse + bucket.time / 2) - Date.now();
                        ok = false;

                        if (bucket.sentWarn) {
                            return;
                        } else {
                            return msg.channel.createMessage(this.shard.lm.t("commands.cooldown", { username: msg.author.username, time: Math.round(waitTime / 1000) }))
                                .then(() => bucket ? bucket.sentWarn = true : true) // tslint:disable-line;no-unused-expression
                                .catch((e: Error) => console.error(e)); // tslint:disable-line:no-unused-expression
                        }
                    }
                }
            }

            return;
        };

        if (this.shard.hibikiOptions.hibiki.owners.indexOf(msg.author.id) === -1) {
            if (bucket) {
                useBucket();
            } else {
                this.buckets.set(msg.author.id, new Ratelimiter());
                bucket = this.buckets.get(msg.author.id);
                useBucket();
            }
        } else {
            ok = true;
        }

        if (!ok) {
            return;
        }

        if (cmd.ownerOnly && this.shard.hibikiOptions.hibiki.owners.indexOf(msg.author.id) === -1) {
            return Promise.reject(new Error("Command is owner only"));
        }

        let newArgs: { [key: string]: any } = {};
        let newPerms: { [key: string]: boolean } = {};
        let newBotPerms: { [key: string]: boolean } = {};

        try {
            newArgs = await this.checkArguments(msg, args._, cmd.args || []);
        } catch (e) {
            return msg.channel.createMessage(e);
        }

        try {
            newPerms = await this.checkPermissions(msg, cmd.perms || []);
        } catch (e) {
            return msg.channel.createMessage(e);
        }

        try {
            newBotPerms = await this.checkBotPermissions(msg, cmd.botPerms || []);
        } catch (e) {
            return msg.channel.createMessage(e);
        }

        const ctx: Context = new Context(this.shard, msg, prefix, command, args, newArgs);

        if (ok) {
            this.shard.logger.msg(msg);

            return cmd.run(ctx);
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Check the permissions
     *
     * @param {Eris.Message} msg Message
     * @param {ICommandPermission[]} perms Array of permissions
     * @returns {Promise<map>}
     */
    public checkPermissions (msg: Eris.Message, perms: ICommandPermission[]): Promise<{ [key: string]: boolean }> {
        const newPerms: { [key: string]: boolean } = {};

        if (!(msg.channel instanceof Eris.GuildChannel)) {
            for (const perm of perms) {
                newPerms[perm.name] = true;
            }

            return Promise.resolve(newPerms);
        }

        for (const perm of perms) {
            if (!perm.optional && !msg.channel.permissionsOf(msg.author.id).has(perm.name)) {
                return Promise.reject(this.shard.lm.t("permissions.user_lack_perms", {
                    permission: this.shard.lm.localizedPerm(perm.name),
                    username: msg.author.username,
                }));
            }

            newPerms[perm.name] = msg.channel.permissionsOf(msg.author.id).has(perm.name);
        }

        return Promise.resolve(newPerms);
    }

    /**
     * Check the bot permissions
     *
     * @param {Eris.Message} msg Message
     * @param {ICommandPermission[]} perms Array of permissions
     * @returns {Promise<map>}
     */
    public checkBotPermissions (msg: Eris.Message, perms: ICommandPermission[]): Promise<{ [key: string]: boolean }> {
        const newPerms: { [key: string]: boolean } = {};

        if (!(msg.channel instanceof Eris.GuildChannel)) {
            for (const perm of perms) {
                newPerms[perm.name] = true;
            }

            return Promise.resolve(newPerms);
        }

        for (const perm of perms) {
            if (!perm.optional && !msg.channel.permissionsOf(this.shard.user.id).has(perm.name)) {
                return Promise.reject(this.shard.lm.t("permissions.bot_lack_perms", {
                    permission: this.shard.lm.localizedPerm(perm.name),
                    username: msg.author.username,
                }));
            }

            newPerms[perm.name] = msg.channel.permissionsOf(this.shard.user.id).has(perm.name);
        }

        return Promise.resolve(newPerms);
    }

    /**
     * Check the arguments and return new args
     *
     * @todo add search things
     * @todo add websockets and try to get the guild/user from another shard
     *
     * @param {Eris.Message} msg Message
     * @param {string[]} given Array of given arguments
     * @param {ICommandArg[]} args Array of command args
     * @returns {Promise<map>}
     */
    public checkArguments (msg: Eris.Message, given: string[], args: ICommandArg[]): Promise<{ [key: string]: any }> {
        const newArgs: { [key: string]: any } = {};

        for (const arg of args) {
            const i: number = args.indexOf(arg);
            if (!given[i]) {
                if (arg.optional) {
                    continue;
                } else {
                    return Promise.reject(this.shard.lm.t("commands.argument_not_specified", { username: msg.author.username, argument: arg.name }));
                }
            }
            switch (arg.type) {
                case "number": {
                    if (isNaN(given[i] as any)) {
                        return Promise.reject(this.shard.lm.t("commands.invalid_argument_type", {
                            argument: arg.name,
                            type: arg.type,
                            username: msg.author.username,
                        }));
                    }
                    break;
                }
                case "user": {
                    const mention: RegExp = /<@!?(\d+)>/i;
                    const userdisc: RegExp = /.{0,32}#\d{4}/i;
                    const username: RegExp = /.{0,32}/i;
                    const id: RegExp = /\d+/i;

                    if (!mention.test(given[i]) && !userdisc.test(given[i]) && !username.test(given[i]) && !id.test(given[i])) {
                        return Promise.reject(this.shard.lm.t("commands.invalid_argument_type", {
                            argument: arg.name,
                            type: arg.type,
                            username: msg.author.username,
                        }));
                    }

                    // meme
                    if (given[i] === "me") {
                        newArgs[arg.name] = msg.author;
                    } else if (mention.test(given[i])) {
                        const res: RegExpExecArray | null = mention.exec(given[i]);

                        if (res) {
                            const user: Eris.User | undefined = this.shard.users.get(res[1]);
                            if (user) {
                                newArgs[arg.name] = user;
                            }
                        }
                    } else if (userdisc.test(given[i])) {
                        if (!(msg.channel instanceof Eris.GuildChannel)) {
                            return Promise.reject(this.shard.lm.t("commands.guild_only", { username: msg.author.username }));
                        }

                        const user: Eris.Member | undefined = msg.channel.guild.members.filter((member: Eris.Member) => `${member.username}#${member.discriminator}` === given[i])[0];

                        if (!user) {
                            return Promise.reject(this.shard.lm.t("search.user_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = user;
                    } else if (id.test(given[i])) {
                        const user: Eris.User | undefined = this.shard.users.get(given[i]);

                        if (!user) {
                            return Promise.reject(this.shard.lm.t("search.user_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = user;
                    } else if (username.test(given[i])) {
                        if (!(msg.channel instanceof Eris.GuildChannel)) {
                            return Promise.reject(this.shard.lm.t("commands.guild_only", { username: msg.author.username }));
                        }

                        const user: Eris.Member | undefined = msg.channel.guild.members.filter((member: Eris.Member) => `${member.username}` === given[i])[0];

                        if (!user) {
                            return Promise.reject(this.shard.lm.t("search.user_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = user;
                    }

                    break;
                }

                case "channel": {
                    const mention: RegExp = /<#(\d+)>/i;
                    const name: RegExp = /[^\s]{0,100}/i;
                    const id: RegExp = /\d+/i;

                    if (!(msg.channel instanceof Eris.GuildChannel)) {
                        return Promise.reject(this.shard.lm.t("commands.guild_only", { username: msg.author.username }));
                    }

                    if (!mention.test(given[i]) && !name.test(given[i]) && !id.test(given[i])) {
                        return Promise.reject(this.shard.lm.t("commands.invalid_argument_type", {
                            argument: arg.name,
                            type: arg.type,
                            username: msg.author.username,
                        }));
                    }

                    if (given[i] === "this") {
                        newArgs[arg.name] = msg.channel;
                    } else if (mention.test(given[i])) {
                        const res: RegExpExecArray | null = mention.exec(given[i]);

                        if (!res) {
                            return Promise.reject(this.shard.lm.t("search.channel_not_found", { username: msg.author.username }));
                        }

                        const channel: Eris.GuildChannel = msg.channel.guild.channels.filter((c: Eris.GuildChannel) => c.type === 0 && c.id === res[0])[0];

                        if (!channel) {
                            return Promise.reject(this.shard.lm.t("search.channel_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = channel;
                    } else if (id.test(given[i])) {
                        const channel: Eris.GuildChannel = msg.channel.guild.channels.filter((c: Eris.GuildChannel) => c.type === 0 && c.id === given[i])[0];

                        if (!channel) {
                            return Promise.reject(this.shard.lm.t("search.channel_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = channel;
                    } else if (name.test(given[i])) {
                        const channel: Eris.GuildChannel = msg.channel.guild.channels.filter((c: Eris.GuildChannel) => c.type === 0 && c.name.indexOf(given[i]) > -1)[0];

                        if (!channel) {
                            return Promise.reject(this.shard.lm.t("search.channel_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = channel;
                    }

                    break;
                }

                case "role": {
                    const mention: RegExp = /<&\d+>/i;
                    const name: RegExp = /.{0,100}/i;
                    const id: RegExp = /\d+/i;

                    if (!(msg.channel instanceof Eris.GuildChannel)) {
                        return Promise.reject(this.shard.lm.t("commands.guild_only", { username: msg.author.username }));
                    }

                    if (!mention.test(given[i]) && !name.test(given[i]) && !id.test(given[i])) {
                        return Promise.reject(this.shard.lm.t("commands.invalid_argument_type", {
                            argument: arg.name,
                            type: arg.type,
                            username: msg.author.username,
                        }));
                    }

                    if (mention.test(given[i])) {
                        const res: RegExpExecArray | null = mention.exec(given[i]);

                        if (!res) {
                            return Promise.reject(this.shard.lm.t("search.role_not_found", { username: msg.author.username }));
                        }

                        const role: Eris.Role | undefined = msg.channel.guild.roles.get(res[0]);

                        if (!role) {
                            return Promise.reject(this.shard.lm.t("search.role_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = role;
                    } else if (name.test(given[i])) {
                        const role: Eris.Role = msg.channel.guild.roles.filter((r: Eris.Role) => r.name.indexOf(given[i]) > -1)[0];

                        if (!role) {
                            return Promise.reject(this.shard.lm.t("search.role_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = role;
                    }

                    break;
                }

                case "guild": {
                    const name: RegExp = /.{0,100}/i;
                    const id: RegExp = /\d+/i;

                    if (!name.test(given[i]) && !id.test(given[i])) {
                        return Promise.reject(this.shard.lm.t("commands.invalid_argument_type", {
                            argument: arg.name,
                            type: arg.type,
                            username: msg.author.username,
                        }));
                    }

                    if (id.test(given[i])) {
                        const guild: Eris.Guild | undefined = this.shard.guilds.get(given[i]);

                        if (!guild) {
                            return Promise.reject(this.shard.lm.t("search.guild_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = guild;
                    } else if (name.test(given[i])) {
                        const guild: Eris.Guild = this.shard.guilds.filter((g: Eris.Guild) => g.name.indexOf(given[i]) > -1)[0];

                        if (!guild) {
                            return Promise.reject(this.shard.lm.t("search.guild_not_found", { username: msg.author.username }));
                        }

                        newArgs[arg.name] = guild;
                    }

                    break;
                }

                case "string":
                default: {
                    newArgs[arg.name] = given[i];

                    return Promise.resolve(newArgs);
                }
            }
        }

        return Promise.resolve(newArgs);
    }

}
