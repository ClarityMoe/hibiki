// Command.ts - Command class (noud02)

import { Context } from "./Context";

export interface ICommandArg {
    name: string;
    optional: boolean;
}

export interface ICommandFlag {
    flag: string;
    abbr: string;

}

export class Command {

    public name: string;
    public desc: string;
    public args: ICommandArg[] = [];
    public flags: ICommandFlag[] = [];
    public subcommands: Array<(ctx: Context) => any> = [];
    public ownerOnly: boolean = false;

    public run (ctx: Context): Promise<any> {
        return ctx.send("This command does not have a valid run function");
    }

}
