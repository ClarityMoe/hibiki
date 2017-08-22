import { Context } from "./Context";
/**
 * Command argument
 *
 * @export
 * @interface ICommandArgument
 */
export interface ICommandArgument {
    action?(ctx: Context): Promise<any>;
    type?: any;
    optional?: boolean;
    name: string;
}
/**
 * Command flag
 *
 * @export
 * @interface ICommandFlag
 */
export interface ICommandFlag {
    action?(ctx: Context): Promise<any>;
    abbr?: string;
    desc?: string;
    name: string;
}
/**
 * Command config
 *
 * @export
 * @interface ICommandConfig
 */
export interface ICommandConfig {
    aliases?: string[];
    arguments?: {
        [key: string]: ICommandArgument;
    };
    category?: string;
    description: string;
    flags?: {
        [key: string]: ICommandFlag;
    };
    pkg: ICommandPackage;
    subcommands?: string[];
}
/**
 * Subcommand config
 *
 * @todo add subcommands on subcommands
 * @export
 * @interface ISubcommandConfig
 */
export interface ISubcommandConfig {
    aliases?: string[];
    arguments?: {
        [key: string]: ICommandArgument;
    };
    command: string;
    description: string;
    flags?: {
        [key: string]: ICommandFlag;
    };
}
/**
 * Command package
 *
 * @export
 * @interface ICommandPackage
 */
export interface ICommandPackage {
    name: string;
    version: string;
    description: string;
    author: string;
    contributors: string[];
    scripts?: {
        [key: string]: string;
    } | {};
    directories?: {
        [key: string]: string;
    } | {};
    dependencies: {
        [key: string]: string;
    } | {};
}
/**
 * Command class
 *
 * @export
 * @class Command
 */
export declare class Command {
    private config;
    run: ((ctx: Context) => Promise<any>) | undefined;
    /**
     * Creates an instance of Command.
     * @param {ICommandConfig} config
     * @param {(ctx: Context) => Promise<any>} [run]
     * @memberof Command
     */
    constructor(config: ICommandConfig, run?: ((ctx: Context) => Promise<any>) | undefined);
    /**
     * Aliases for the command
     *
     * @type {string[]}
     * @memberof Command
     */
    readonly aliases: string[];
    /**
     * Arguments on the command
     *
     * @type {{ [key: string]: ICommandArgument }}
     * @memberof Command
     */
    readonly arguments: {
        [key: string]: ICommandArgument;
    };
    /**
     * Flags on the command
     *
     * @type {{ [key: string]: ICommandFlag }}
     * @memberof Command
     */
    readonly flags: {
        [key: string]: ICommandFlag;
    };
    /**
     * Subcommands on the command
     *
     * @type {string[]}
     * @memberof Command
     */
    readonly subcommands: string[];
    /**
     * Description of the command
     *
     * @type {string}
     * @memberof Command
     */
    readonly description: string;
    /**
     * Category of the command
     *
     * @type {string}
     * @memberof Command
     */
    readonly category: string;
    /**
     * Package file of the package the command came with
     *
     * @type {ICommandPackage}
     * @memberof Command
     */
    readonly pkg: ICommandPackage;
}
