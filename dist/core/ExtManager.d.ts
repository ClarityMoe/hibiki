/// <reference types="node" />
import { EventEmitter } from "events";
import { Shard } from "../client/Shard";
import { Command, ICommandConfig, ISubcommandConfig } from "./Command";
/**
 * Extension manager
 *
 * @export
 * @class ExtManager
 * @extends {EventEmitter}
 */
export declare class ExtManager extends EventEmitter {
    private shard;
    /**
     * Loaded commands
     *
     * @type {Map<string, Command>}
     * @memberof ExtManager
     */
    commands: Map<string, Command>;
    /**
     * Loaded subcommands
     *
     * @type {Map<string, Command>}
     * @memberof ExtManager
     */
    subcommands: Map<string, Command>;
    /**
     * Creates an instance of ExtManager.
     * @param {Shard} shard
     * @memberof ExtManager
     */
    constructor(shard: Shard);
    /**
     * Initializes the extension manager
     *
     * @returns {Promise<void>}
     * @memberof ExtManager
     */
    init(): Promise<void>;
    /**
     * Breaks/Stops the extension manager
     *
     * @returns {Promise<void>}
     * @memberof ExtManager
     */
    break(): Promise<void>;
    /**
     * Decorator for commands
     *
     * @decorator
     * @param {ICommandConfig} config
     * @returns {(target: any, key: string, descriptor: PropertyDescriptor) => void}
     * @memberof ExtManager
     */
    command(config: ICommandConfig): (target: any, key: string, descriptor: PropertyDescriptor) => void;
    /**
     * Decorator for subcommands
     *
     * @decorator
     * @param {string} command
     * @param {ISubcommandConfig} config
     * @returns {(target: any, key: string, descriptor: PropertyDescriptor) => void}
     * @memberof ExtManager
     */
    subcommand(command: string, config: ISubcommandConfig): (target: any, key: string, descriptor: PropertyDescriptor) => void;
    /**
     * Decorator for client events
     *
     * @decorator
     * @param {string} event
     * @returns {(target: any, key: string, descriptor: PropertyDescriptor) => void}
     * @memberof ExtManager
     */
    event(event: string): (target: any, key: string, descriptor: PropertyDescriptor) => void;
}
