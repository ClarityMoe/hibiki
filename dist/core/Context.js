"use strict";
// Context.ts - Context class for commands (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Context class for commands
 *
 * @export
 * @class Context
 */
class Context {
    /**
     * Creates an instance of Context.
     * @param {Shard} shard
     * @param {Eris.Message} msg
     * @memberof Context
     */
    constructor(shard, msg) {
        this.shard = shard;
        this.msg = msg;
        /**
         * User that executed the command
         *
         * @type {Eris.User}
         * @memberof Context
         */
        this.author = this.msg.author;
        /**
         * Channel the command was executed in
         *
         * @type {(Eris.Channel | Eris.GuildChannel | Eris.PrivateChannel)}
         * @memberof Context
         */
        this.channel = this.msg.channel;
        /**
         * Guild the command was executed in
         *
         * @type {(Eris.Guild | null)}
         * @memberof Context
         */
        this.guild = this.msg.channel.guild;
        /**
         * Member that executed the command
         *
         * @type {(Eris.Member | void)}
         * @memberof Context
         */
        this.member = this.msg.member;
    }
    /**
     * Sends a message to the channel the command was executed in
     *
     * @param {Eris.MessageContent} content
     * @param {Eris.MessageFile} [file]
     * @returns {Promise<Eris.Message>}
     * @memberof Context
     */
    send(content, file) {
        return this.msg.channel.createMessage(content, file);
    }
}
exports.Context = Context;
