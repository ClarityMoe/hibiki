"use strict";
// ExtManager.ts - Extension manager (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const sanic = require("sanic");
const Command_1 = require("./Command");
// import { Context } from "./Context";
/**
 * Extension manager
 *
 */
class ExtManager extends events_1.EventEmitter {
    /**
     * Creates an instance of ExtManager.
     * @param {Shard} shard
     */
    constructor(shard) {
        super();
        this.shard = shard;
        /**
         * Loaded commands
         *
         */
        this.commands = new Map();
        /**
         * Loaded subcommands
         *
         */
        this.subcommands = new Map();
    }
    /**
     * Initializes the extension manager
     *
     * @returns {Promise<void>}
     */
    init() {
        return new Promise((resolve, reject) => {
            sanic(function* () {
                /** @todo add command loader */
                yield Promise.resolve("temp yield here");
            })()
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * Breaks/Stops the extension manager
     *
     * @returns {Promise<void>}
     */
    break() {
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
    command(config) {
        return (_target, key, descriptor) => {
            const cmd = new Command_1.Command(config, descriptor.value);
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
    subcommand(command, config) {
        return (_target, key, descriptor) => {
            const cmd = new Command_1.Command(config, descriptor.value);
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
    event(event) {
        return (_target, _key, descriptor) => {
            this.shard.client.on(event, descriptor.value);
        };
    }
}
exports.ExtManager = ExtManager;
