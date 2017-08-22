import { Context } from "./Context";

export interface ICommandArgument {
    action?: (ctx: Context) => Promise<any>;
    type?: any;
    optional?: boolean;
    name: string;
}

export interface ICommandFlag {
    action?: (ctx: Context) => Promise<any>;
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
    scripts: { [string]: string };
    directories: { [string]: string };
    dependencies: { [string]: string };
}

export const defaultPackage: ICommandPackage = {
    name: "Unknown Package",
    version: "0.0.0-unknown",
    description: "",
    author: "Unknown",
    contributors: {},
    scripts: {},
    directories: {},
    dependencies: {},
};

export class Command {

    constructor(private config: ICommandConfig, public run?: (ctx: Context) => Promise<any>) {}

    public readonly aliases: string[] = this.config.aliases || [];
    public readonly arguments: { [string]: ICommandArgument } = this.config.arguments || {};
    public readonly flags: { [string]: ICommandFlag } = this.config.flags || {};
    public readonly subcommands: string[] = this.config.subcommands || [];
    public readonly description: string = this.config.description || "Command doesn't have a description";
    public readonly category: string = this.config.category || "Other";
    public readonly pkg: ICommandPackage = this.config.pkg || defaultPackage;

}
