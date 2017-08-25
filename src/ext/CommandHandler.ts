// CommandHandler.ts - Command handler (noud02)

import * as Eris from "eris";
import * as minimist from "minimist";
import * as pg from "pg";
import { Shard } from "../client/Shard";
import { Command } from "./Command";
import { Context } from "./Context";

export class CommandHandler {

    constructor (private shard: Shard) {}

    public init (): Promise<void> {
        // link the messageCreate event to checkMessage to check if the message is a command
        // can safely void the error because I don't think there will be any important stuff
        this.shard.on("messageCreate", (msg: Eris.Message) => this.checkMessage(msg).catch((e: Error) => void(e))); // tslint:disable-line:no-unused-expression

        return Promise.resolve();
    }

    public async checkMessage (msg: Eris.Message): Promise<void> {
        let guildPrefixes: string[] = [];
        let usedPrefix: string = "";
        let command: string = "";
        let args: minimist.ParsedArgs;

        if (msg.channel instanceof Eris.GuildChannel) {
            const res: pg.QueryResult = await this.shard.pg.select("guilds", `id = ${msg.channel.guild.id}`);
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
        args = minimist(msg.content.substring(usedPrefix.length).split(" ").slice(1));

        return this.executeCommand(msg, command, args, usedPrefix);
    }

    public executeCommand (msg: Eris.Message, command: string, args: minimist.ParsedArgs, prefix: string): Promise<any> {
        const cmd: Command | undefined = this.shard.ext.commands.get(command);

        if (!cmd) {
            return Promise.reject(new Error(`Command ${command} not found`));
        }

        console.log(cmd.ownerOnly);

        if (cmd.ownerOnly && this.shard.hibikiOptions.hibiki.owners.indexOf(msg.author.id) === -1) {
            return;
        }

        const ctx: Context = new Context(this.shard, msg, prefix, command, args);

        return cmd.run(ctx);
    }

}
