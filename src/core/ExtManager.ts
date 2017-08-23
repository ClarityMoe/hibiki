// ExtManager.ts - Extension manager (noud02)

import { EventEmitter } from "events";
import * as sanic from "sanic";
import { Shard } from "../client/Shard";
import { Command, ICommandConfig, ISubcommandConfig } from "./Command";
// import { Context } from "./Context";

/**
 * Extension manager
 *
 */
export class ExtManager extends EventEmitter {

    /**
     * Loaded commands
     *
     */
    public commands: Map<string, Command> = new Map<string, Command>();

    /**
     * Loaded subcommands
     *
     */
    public subcommands: Map<string, Command> = new Map<string, Command>();

    /**
     * Creates an instance of ExtManager.
     * @param {Shard} shard
     */
    constructor (private shard: Shard) {
        super();
    }

    /**
     * Initializes the extension manager
     *
     * @returns {Promise<void>}
     */
    public init (): Promise<void> {
        return sanic(function* () {
            /** @todo add command loader */
            yield Promise.resolve("temp yield here");
        })();
    }

    /**
     * Breaks/Stops the extension manager
     *
     * @returns {Promise<void>}
     */
    public break (): Promise<void> {
        this.commands.clear();
        this.subcommands.clear();

        return Promise.resolve();
    }

    /**
     * Decorator for commands
     *
     * @decorator
     * @param {ICommandConfig} config
     * @returns {(target: any, key: string, descriptor: PropertyDescriptor) => void}
     */
    public command (config: ICommandConfig): (target: any, key: string, descriptor: PropertyDescriptor) => void {
        return (_target: any, key: string, descriptor: PropertyDescriptor) => {

            const cmd: Command = new Command(config, descriptor.value);

            this.commands.set(config.name || key, cmd);
        };
    }

    /**
     * Decorator for subcommands
     *
     * @decorator
     * @param {string} command
     * @param {ISubcommandConfig} config
     * @returns {(target: any, key: string, descriptor: PropertyDescriptor) => void}
     */
    public subcommand (command: string, config: ISubcommandConfig): (target: any, key: string, descriptor: PropertyDescriptor) => void {
        return (_target: any, key: string, descriptor: PropertyDescriptor) => {
            const cmd: Command = new Command(config, descriptor.value);

            this.subcommands.set(`${command}.${config.name || key}`, cmd);
        };
    }

    /**
     * Decorator for client events
     *
     * @decorator
     * @param {string} event
     * @returns {(target: any, key: string, descriptor: PropertyDescriptor) => void}
     */
    public event (event: string): (target: any, key: string, descriptor: PropertyDescriptor) => void {
        return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
            this.shard.client.on(event, descriptor.value);
        };
    }
}
