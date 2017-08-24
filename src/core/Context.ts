// Context.ts - Context class for commands (noud02)

import * as Eris from "eris";
import { Shard } from "../client/Shard";

/**
 * Context class for commands
 *
 */
export class Context {

    /**
     * Creates an instance of Context.
     * @param {Shard} shard
     * @param {Eris.Message} msg
     */
    constructor (public shard: Shard, public msg: Eris.Message) {}

    /**
     * User that executed the command
     *
     */
    public author: Eris.User = this.msg.author;

    /**
     * Channel the command was executed in
     *
     */
    public channel: Eris.Channel | Eris.GuildChannel | Eris.PrivateChannel = this.msg.channel;

    /**
     * Guild the command was executed in
     *
     */
    public guild: Eris.Guild | null = this.msg.channel.guild;

    /**
     * Member that executed the command
     *
     */
    public member: Eris.Member | void = this.msg.member;

    /**
     * Sends a message to the channel the command was executed in
     *
     * @param {Eris.MessageContent} content
     * @param {Eris.MessageFile} [file]
     * @returns {Promise<Eris.Message>}
     */
    public send (content: Eris.MessageContent, file?: Eris.MessageFile): Promise<Eris.Message> {
        return this.msg.channel.createMessage(content, file);
    }

    /**
     * alias to send
     * @param {Eris.Channel.id} id
     * @param {Eris.MessageContent} content
     * @param {Eris.MessageFile} [file]
     * @returns {Promise<Eris.Message>}
     */
    public createMessage ( content: Eris.MessageContent, file?: Eris.MessageFile, id?: Eris.Channel.id): Promise<Eris.Message> {
        if (!id) {
            return this.send(content, file);
        } else {
            return this.msg.createMessage(id, content, file);
        }
    }
}
