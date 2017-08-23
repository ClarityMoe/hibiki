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
 */
class Command {
    /**
     * Creates an instance of Command.
     * @param ICommandConfig config
     * @param (ctx: Context) => Promise<any> [run]
     */
    constructor(config, run) {
        this.config = config;
        this.run = run;
        /**
         * Aliases for the command
         *
         */
        this.aliases = this.config.aliases || [];
        /**
         * Arguments on the command
         *
         */
        this.arguments = this.config.arguments || {};
        /**
         * Flags on the command
         *
         */
        this.flags = this.config.flags || {};
        /**
         * Subcommands on the command
         *
         */
        this.subcommands = this.config.subcommands || [];
        /**
         * Description of the command
         *
         */
        this.description = this.config.description || "Command doesn't have a description";
        /**
         * Category of the command
         *
         */
        this.category = this.config.category || "Other";
        /**
         * Package file of the package the command came with
         *
         */
        this.pkg = this.config.pkg || defaultPackage;
    }
}
exports.Command = Command;
