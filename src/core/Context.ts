// Context.ts - Context class for commands (noud02);

import * as Eris from "eris";
import { Shard } from "../client/Shard";

export class Context {

    constructor (public shard: Shard, public msg: Eris.Message) {}

    public author: Eris.User = this.msg.author;
    public channel: Eris.Channel | Eris.GuildChannel = this.msg.channel;
    public guild: Eris.Guild | void = this.msg.channel.guild;
    public member: Eris.Member | void = this.msg.member;

    public send (content: Eris.MessageContent, file?: Eris.MessageFile): Promise<Eris.Message> {
        return this.msg.channel.createMessage(content, file);
    }
}
