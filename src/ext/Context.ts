// Context.ts - Context for commands (noud02)

import * as Eris from "eris";
import * as minimist from "minimist";
import { Shard } from "../client/Shard";

export class Context {

    public author: Eris.User = this.msg.author;
    public channel: Eris.GuildChannel | Eris.PrivateChannel | Eris.GroupChannel = this.msg.channel;
    public channelMentions?: string[] | undefined = this.msg.channelMentions;
    public guild?: Eris.Guild | undefined = this.msg.channel instanceof Eris.GuildChannel ? this.msg.channel.guild : undefined;
    public member?: Eris.Member | undefined = this.msg.member;
    public mentions: Eris.User[] = this.msg.mentions;
    public timestamp: number = this.msg.timestamp;
    public editedTimestamp: number | undefined = this.msg.editedTimestamp;
    public roleMentions: string[] = this.msg.roleMentions;

    constructor (public shard: Shard, public msg: Eris.Message, public prefix: string, public command: string, public args: minimist.ParsedArgs) {}

    public send (...args: any[]): Promise<Eris.Message> {
        return this.msg.channel.createMessage(args.join(" "));
    }

    public sendCode (type: string, ...code: any[]): Promise<Eris.Message> {
        return this.msg.channel.createMessage(`\`\`\`${type}\n${code.join(" ")}\`\`\``);
    }

}
