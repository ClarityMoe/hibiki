import { EventEmitter } from "events";
import sanic = require("sanic");
import { Shard } from "../client/Shard";
import { Command } from "./Command";
import { Context } from "./Context";

export class ExtManager extends EventEmitter {

    public commands: Map<string, Command> = new Map<string, Command>();
    public subcommands: Map<string, Command> = new Map<string, Command>();

    constructor(private shard: Shard) {
        super();
    }

    public command(config: Object): (target: any, key: string, descriptor: PropertyDescriptor) => void {
        return (target: any, key: string, descriptor: PropertyDezcriptor) => {

            const cmd: Command = new Command(config, descriptor.value);

            this.commands.set(config.name || key, cmd);
        };
    }

    public subcommand(command: string, config: Object): (target: any, key: string, descriptor: PropertyDescriptor) => void {
        return (target: any, key: string, descriptor: PropertyDescriptor) => {
            const cmd: Command = new Command(config, descriptor.value);

            this.subcommands.set(`${command}.${config.name || key}`, cmd);
        };
    }

    public event(event: string, emitter: string, once?: boolean): (target: any, key: string, descriptor: PropertyDescriptor) => void {
        return (target: any, key: string, descriptor: PropertyDescriptor) => {
            this.shard[emitter][once && "once" || "on"](event, descriptor.value);
        };
    }

    public exec(command: string, ctx: Context) {
    }
}
