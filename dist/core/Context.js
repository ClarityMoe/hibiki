"use strict";
// Context.ts - Context class for commands (noud02);
Object.defineProperty(exports, "__esModule", { value: true });
class Context {
    constructor(shard, msg) {
        this.shard = shard;
        this.msg = msg;
        this.author = this.msg.author;
        this.channel = this.msg.channel;
        this.guild = this.msg.channel.guild;
        this.member = this.msg.member;
    }
    send(content, file) {
        return this.msg.channel.createMessage(content, file);
    }
}
exports.Context = Context;
