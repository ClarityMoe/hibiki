"use strict";
// Context.ts - Context class for commands (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Context class for commands
 *
 */
class Context {
    /**
     * Creates an instance of Context.
     * @param {Shard} shard
     * @param {Eris.Message} msg
     */
    constructor(shard, msg) {
        this.shard = shard;
        this.msg = msg;
        /**
         * User that executed the command
         *
         */
        this.author = this.msg.author;
        /**
         * Channel the command was executed in
         *
         */
        this.channel = this.msg.channel;
        /**
         * Guild the command was executed in
         *
         */
        this.guild = this.msg.channel.guild;
        /**
         * Member that executed the command
         *
         */
        this.member = this.msg.member;
    }
    /**
     * Sends a message to the channel the command was executed in
     *
     * @param {Eris.MessageContent} content
     * @param {Eris.MessageFile} [file]
     * @returns {Promise<Eris.Message>}
     */
    send(content, file) {
        return this.msg.channel.createMessage(content, file);
    }
}
exports.Context = Context;
