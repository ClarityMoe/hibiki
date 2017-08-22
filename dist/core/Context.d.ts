import * as Eris from "eris";
import { Shard } from "../client/Shard";
/**
 * Context class for commands
 *
 * @export
 * @class Context
 */
export declare class Context {
    shard: Shard;
    msg: Eris.Message;
    /**
     * Creates an instance of Context.
     * @param {Shard} shard
     * @param {Eris.Message} msg
     * @memberof Context
     */
    constructor(shard: Shard, msg: Eris.Message);
    /**
     * User that executed the command
     *
     * @type {Eris.User}
     * @memberof Context
     */
    author: Eris.User;
    /**
     * Channel the command was executed in
     *
     * @type {(Eris.Channel | Eris.GuildChannel | Eris.PrivateChannel)}
     * @memberof Context
     */
    channel: Eris.Channel | Eris.GuildChannel | Eris.PrivateChannel;
    /**
     * Guild the command was executed in
     *
     * @type {(Eris.Guild | null)}
     * @memberof Context
     */
    guild: Eris.Guild | null;
    /**
     * Member that executed the command
     *
     * @type {(Eris.Member | void)}
     * @memberof Context
     */
    member: Eris.Member | void;
    /**
     * Sends a message to the channel the command was executed in
     *
     * @param {Eris.MessageContent} content
     * @param {Eris.MessageFile} [file]
     * @returns {Promise<Eris.Message>}
     * @memberof Context
     */
    send(content: Eris.MessageContent, file?: Eris.MessageFile): Promise<Eris.Message>;
}
