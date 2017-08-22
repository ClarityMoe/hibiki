import * as Eris from "eris";
import { Shard } from "../client/Shard";
/**
 * Context class for commands
 *
 */
export declare class Context {
    shard: Shard;
    msg: Eris.Message;
    /**
     * Creates an instance of Context.
     * @param {Shard} shard
     * @param {Eris.Message} msg
     */
    constructor(shard: Shard, msg: Eris.Message);
    /**
     * User that executed the command
     *
     */
    author: Eris.User;
    /**
     * Channel the command was executed in
     *
     */
    channel: Eris.Channel | Eris.GuildChannel | Eris.PrivateChannel;
    /**
     * Guild the command was executed in
     *
     */
    guild: Eris.Guild | null;
    /**
     * Member that executed the command
     *
     */
    member: Eris.Member | void;
    /**
     * Sends a message to the channel the command was executed in
     *
     * @param {Eris.MessageContent} content
     * @param {Eris.MessageFile} [file]
     * @returns {Promise<Eris.Message>}
     */
    send(content: Eris.MessageContent, file?: Eris.MessageFile): Promise<Eris.Message>;
}
