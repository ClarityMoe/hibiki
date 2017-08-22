import * as Eris from "eris";
import { Shard } from "../client/Shard";
export declare class Context {
    shard: Shard;
    msg: Eris.Message;
    constructor(shard: Shard, msg: Eris.Message);
    author: Eris.User;
    channel: Eris.Channel | Eris.GuildChannel;
    guild: Eris.Guild | void;
    member: Eris.Member | void;
    send(content: Eris.MessageContent, file?: Eris.MessageFile): Promise<Eris.Message>;
}
