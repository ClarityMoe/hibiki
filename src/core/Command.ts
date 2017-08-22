// Command.ts - Command class (noud02)

import { Context } from "./Context";

export interface ICommandArgument {
    action? (ctx: Context): Promise<any>;
    type?: any;
    optional?: boolean;
    name: string;
}

export interface ICommandFlag {
    action? (ctx: Context): Promise<any>;
    abbr?: string;
    desc?: string;
    name: string;
}

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

export const defaultPackage: ICommandPackage = {
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
export class Command {

    /**
     * Creates an instance of Command.
     * @param {ICommandConfig} config
     * @param {(ctx: Context) => Promise<any>} [run]
     * @memberof Command
     */
    constructor (private config: ICommandConfig, public run?: (ctx: Context) => Promise<any>) {}

    /**
     * Aliases for the command
     *
     * @type {string[]}
     * @memberof Command
     */
    public readonly aliases: string[] = this.config.aliases || [];

    /**
     * Arguments on the command
     *
     * @type {{ [key: string]: ICommandArgument }}
     * @memberof Command
     */
    public readonly arguments: { [key: string]: ICommandArgument } = this.config.arguments || {};

    /**
     * Flags on the command
     *
     * @type {{ [key: string]: ICommandFlag }}
     * @memberof Command
     */
    public readonly flags: { [key: string]: ICommandFlag } = this.config.flags || {};

    /**
     * Subcommands on the command
     *
     * @type {string[]}
     * @memberof Command
     */
    public readonly subcommands: string[] = this.config.subcommands || [];

    /**
     * Description of the command
     *
     * @type {string}
     * @memberof Command
     */
    public readonly description: string = this.config.description || "Command doesn't have a description";

    /**
     * Category of the command
     *
     * @type {string}
     * @memberof Command
     */
    public readonly category: string = this.config.category || "Other";

    /**
     * Package file of the package the command came with
     *
     * @type {ICommandPackage}
     * @memberof Command
     */
    public readonly pkg: ICommandPackage = this.config.pkg || defaultPackage;

}
