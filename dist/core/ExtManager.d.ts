/// <reference types="node" />
import { EventEmitter } from "events";
import { Shard } from "../client/Shard";
import { Command, ICommandConfig, ISubCommandConfig } from "./Command";
export declare class ExtManager extends EventEmitter {
    private shard;
    commands: Map<string, Command>;
    subcommands: Map<string, Command>;
    constructor(shard: Shard);
    command(config: ICommandConfig): (target: any, key: string, descriptor: PropertyDescriptor) => void;
    subcommand(command: string, config: ISubCommandConfig): (target: any, key: string, descriptor: PropertyDescriptor) => void;
    event(event: string, emitter: string, once?: boolean): (target: any, key: string, descriptor: PropertyDescriptor) => void;
}
