// Command.ts - Command class (noud02)

import { Context } from "./Context";

/**
 * Command argument
 *
 * @interface ICommandArgument
 */
export interface ICommandArgument {
    action? (ctx: Context): Promise<any>;
    type?: any;
    optional?: boolean;
    name: string;
}

/**
 * Command flag
 *
 * @interface ICommandFlag
 */
export interface ICommandFlag {
    action? (ctx: Context): Promise<any>;
    abbr?: string;
    desc?: string;
    name: string;
}

/**
 * Command config
 *
 * @interface ICommandConfig
 */
export interface ICommandConfig {
    aliases?: string[];
    arguments?: { [key: string]: ICommandArgument };
    category?: string;
    description: string;
    flags?: { [key: string]: ICommandFlag };
    name?: string;
    pkg: ICommandPackage;
    subcommands?: string[];
}

/**
 * Subcommand config
 *
 * @todo add subcommands on subcommands
 * @interface ISubcommandConfig
 */
export interface ISubcommandConfig {
    aliases?: string[];
    arguments?: { [key: string]: ICommandArgument };
    command: string;
    description: string;
    flags?: { [key: string]: ICommandFlag };
    name?: string;
    pkg: ICommandPackage;
    // subcommands?: string[];
}

/**
 * Command package
 *
 * @interface ICommandPackage
 */
export interface ICommandPackage {
    name: string;
    version: string;
    description: string;
    author: string;
    contributors: string[];
    scripts?: { [key: string]: string } | {};
    directories?: { [key: string]: string } | {};
    dependencies: { [key: string]: string } | {};
}

const defaultPackage: ICommandPackage = {
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
export class Command {

    /**
     * Creates an instance of Command.
     * @param ICommandConfig config
     * @param (ctx: Context) => Promise<any> [run]
     */
    constructor (private config: ICommandConfig, public run?: (ctx: Context) => Promise<any>) {}

    /**
     * Aliases for the command
     *
     */
    public readonly aliases: string[] = this.config.aliases || [];

    /**
     * Arguments on the command
     *
     */
    public readonly arguments: { [key: string]: ICommandArgument } = this.config.arguments || {};

    /**
     * Flags on the command
     *
     */
    public readonly flags: { [key: string]: ICommandFlag } = this.config.flags || {};

    /**
     * Subcommands on the command
     *
     */
    public readonly subcommands: string[] = this.config.subcommands || [];

    /**
     * Description of the command
     *
     */
    public readonly description: string = this.config.description || "Command doesn't have a description";

    /**
     * Category of the command
     *
     */
    public readonly category: string = this.config.category || "Other";

    /**
     * Package file of the package the command came with
     *
     */
    public readonly pkg: ICommandPackage = this.config.pkg || defaultPackage;

}