// Command.ts - Command class (noud02)

import { Context } from "./Context";

export interface ICommandArg {
    name: string;
    optional: boolean;
    type: string;
}

export interface ICommandFlag {
    flag: string;
    abbr: string;

}

export interface ICommandPermission {
    name: string;
    optional: boolean;
}

/**
 * Command class
 *
 * @export
 * @class Command
 */
export class Command {

    /**
     * Name of the command
     *
     * @type {string}
     */
    public name: string;
    /**
     * Description of the command
     *
     * @type {string}
     */
    public desc: string;
    /**
     * Arguments on the command
     *
     * @type {ICommandArg[]}
     */
    public args: ICommandArg[];
    /**
     * Flags on the command
     *
     * @type {ICommandFlag[]}
     */
    public flags: ICommandFlag[];
    /**
     * Permissions on the command
     *
     * @type {ICommandPermission[]}
     */
    public perms: ICommandPermission[];
    /**
     * Permissions for the bot on the command
     *
     * @type {ICommandPermission[]}
     */
    public botPerms: ICommandPermission[];
    /**
     * Subcommands on the command
     *
     * @type {map<Command>}
     */
    public subcommands: { [key: string]: Command };
    /**
     * Whether the command is owner only or not
     *
     * @type {boolean}
     */
    public ownerOnly: boolean;

    /**
     * Will be run when the command is executed
     *
     * @param {Context} ctx Context
     * @returns {Promise<any>}
     */
    public run (ctx: Context): Promise<any> {
        return ctx.send("This command does not have a valid run function");
    }

}
