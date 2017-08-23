import { Context } from "./Context";
/**
 * Command argument
 *
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
    arguments?: {
        [key: string]: ICommandArgument;
    };
    command: string;
    description: string;
    flags?: {
        [key: string]: ICommandFlag;
    };
    name?: string;
    pkg: ICommandPackage;
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
 */
export declare class Command {
    private config;
    run: ((ctx: Context) => Promise<any>) | undefined;
    /**
     * Creates an instance of Command.
     * @param ICommandConfig config
     * @param (ctx: Context) => Promise<any> [run]
     */
    constructor(config: ICommandConfig, run?: ((ctx: Context) => Promise<any>) | undefined);
    /**
     * Aliases for the command
     *
     */
    readonly aliases: string[];
    /**
     * Arguments on the command
     *
     */
    readonly arguments: {
        [key: string]: ICommandArgument;
    };
    /**
     * Flags on the command
     *
     */
    readonly flags: {
        [key: string]: ICommandFlag;
    };
    /**
     * Subcommands on the command
     *
     */
    readonly subcommands: string[];
    /**
     * Description of the command
     *
     */
    readonly description: string;
    /**
     * Category of the command
     *
     */
    readonly category: string;
    /**
     * Package file of the package the command came with
     *
     */
    readonly pkg: ICommandPackage;
}
