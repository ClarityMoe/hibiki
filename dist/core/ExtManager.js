"use strict";
// ExtManager.ts - Extension manager (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Command_1 = require("./Command");
// import { Context } from "./Context";
class ExtManager extends events_1.EventEmitter {
    constructor(shard) {
        super();
        this.shard = shard;
        this.commands = new Map();
        this.subcommands = new Map();
    }
    command(config) {
        return (target, key, descriptor) => {
            const cmd = new Command_1.Command(config, descriptor.value);
            this.commands.set(config.name || key, cmd);
        };
    }
    subcommand(command, config) {
        return (target, key, descriptor) => {
            const cmd = new Command_1.Command(config, descriptor.value);
            this.subcommands.set(`${command}.${config.name || key}`, cmd);
        };
    }
    event(event, emitter, once) {
        return (target, key, descriptor) => {
            this.shard[emitter][once && "once" || "on"](event, descriptor.value);
        };
    }
}
exports.ExtManager = ExtManager;
