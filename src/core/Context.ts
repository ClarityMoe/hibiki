// Context.ts - Context class for commands (noud02)

import * as Eris from "eris";
import { Shard } from "../client/Shard";

/**
 * Context class for commands
 *
 * @export
 * @class Context
 */
export class Context {

    /**
     * Creates an instance of Context.
     * @param {Shard} shard
     * @param {Eris.Message} msg
     * @memberof Context
     */
    constructor (public shard: Shard, public msg: Eris.Message) {}

    /**
     * User that executed the command
     *
     * @type {Eris.User}
     * @memberof Context
     */
    public author: Eris.User = this.msg.author;

    /**
     * Channel the command was executed in
     *
     * @type {(Eris.Channel | Eris.GuildChannel | Eris.PrivateChannel)}
     * @memberof Context
     */
    public channel: Eris.Channel | Eris.GuildChannel | Eris.PrivateChannel = this.msg.channel;

    /**
     * Guild the command was executed in
     *
     * @type {(Eris.Guild | null)}
     * @memberof Context
     */
    public guild: Eris.Guild | null = this.msg.channel.guild;

    /**
     * Member that executed the command
     *
     * @type {(Eris.Member | void)}
     * @memberof Context
     */
    public member: Eris.Member | void = this.msg.member;

    /**
     * Sends a message to the channel the command was executed in
     *
     * @param {Eris.MessageContent} content
     * @param {Eris.MessageFile} [file]
     * @returns {Promise<Eris.Message>}
     * @memberof Context
     */
    public send (content: Eris.MessageContent, file?: Eris.MessageFile): Promise<Eris.Message> {
        return this.msg.channel.createMessage(content, file);
    }
}
