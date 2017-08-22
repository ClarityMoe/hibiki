"use strict";
// Command.ts - Command class (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const defaultPackage = {
    author: "Unknown",
    contributors: [],
    dependencies: {},
    description: "",
    directories: {},
    name: "Unknown Package",
    scripts: {},
    version: "0.0.0-unknown",
};
/**
 * Command class
 *
 * @export
 * @class Command
 */
class Command {
    /**
     * Creates an instance of Command.
     * @param {ICommandConfig} config
     * @param {(ctx: Context) => Promise<any>} [run]
     * @memberof Command
     */
    constructor(config, run) {
        this.config = config;
        this.run = run;
        /**
         * Aliases for the command
         *
         * @type {string[]}
         * @memberof Command
         */
        this.aliases = this.config.aliases || [];
        /**
         * Arguments on the command
         *
         * @type {{ [key: string]: ICommandArgument }}
         * @memberof Command
         */
        this.arguments = this.config.arguments || {};
        /**
         * Flags on the command
         *
         * @type {{ [key: string]: ICommandFlag }}
         * @memberof Command
         */
        this.flags = this.config.flags || {};
        /**
         * Subcommands on the command
         *
         * @type {string[]}
         * @memberof Command
         */
        this.subcommands = this.config.subcommands || [];
        /**
         * Description of the command
         *
         * @type {string}
         * @memberof Command
         */
        this.description = this.config.description || "Command doesn't have a description";
        /**
         * Category of the command
         *
         * @type {string}
         * @memberof Command
         */
        this.category = this.config.category || "Other";
        /**
         * Package file of the package the command came with
         *
         * @type {ICommandPackage}
         * @memberof Command
         */
        this.pkg = this.config.pkg || defaultPackage;
    }
}
exports.Command = Command;
