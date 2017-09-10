// CommandDeco.ts - Decorators for commands (noud02)

import { Command } from "./Command";

/**
 * @namespace ext
 */

function applyMeta (key: string, val: any): ClassDecorator {
    return <T extends Function>(target: T) => { // tslint:disable-line:ban-types
        Object.defineProperty(target.prototype, key, {
            configurable: true,
            enumerable: true,
            value: val,
            writable: true,
        });

        return target;
    };
}

/**
 * Sets the command name
 *
 * @example @Hibiki.ext.command("nya")
 * class MyCommand extends Hibiki.Command {
 *
 * @decorator
 * @memberof ext
 * @export
 * @param {string} name Command name
 * @returns {ClassDecorator}
 */
export function command (name: string): ClassDecorator {
    return applyMeta("name", name);
}

/**
 * Adds an argument to the command
 *
 * @example @Hibiki.ext.argument("nyan", "user", false)
 * class MyCommand extends Hibiki.Command {
 *
 *      public run (ctx: Hibiki.Context): Promise<any> {
 *          // ctx.args.nyan = given user
 *          ctx.send(ctx.args.nyan.username);
 *
 * @decorator
 * @memberof ext
 * @export
 * @param {string} name Argument name
 * @param {string} type Argument type (user, guild, channel, role, string, number)
 * @param {boolean} optional Whether the argument is optional or not
 * @returns {ClassDecorator}
 */
export function argument (name: string, type: string, optional: boolean): ClassDecorator {
    return <T extends Function>(target: T) => { // tslint:disable-line:ban-types
        if (!target.prototype.args) {
            Object.defineProperty(target.prototype, "args", {
                configurable: true,
                enumerable: true,
                value: [{ name, optional, type }],
                writable: true,
            });

            return target;
        }

        Object.defineProperty(target.prototype, "args", {
            configurable: true,
            enumerable: true,
            value: target.prototype.args.push({ name, optional, type }),
            writable: true,
        });

        return target;
    };
}

/**
 * Adds a required permission
 *
 * @example @Hibiki.ext.permission("manageGuild", true) // set the permission to `optional` because we don't need it
 * class MyCommand extends Hibiki.Command {
 *
 *      public run (ctx: Hibiki.Context): Promise<any> {
 *          ctx.send(ctx.perms.manageGuild) // sends if the user has the permission or not
 *
 * @decorator
 * @memberof ext
 * @export
 * @param {string} name Permission name @see https://abal.moe/Eris/docs/reference
 * @param {boolean} optional Sets the permission to optional
 * @param {boolean} [bot] If the permission should be required by the bot rather than the user
 * @returns {ClassDecorator}
 */
export function permission (name: string, optional: boolean, bot?: boolean): ClassDecorator {
    return <T extends Function>(target: T) => { // tslint:disable-line:ban-types
        if (!target.prototype.perms) {
            Object.defineProperty(target.prototype, bot && "botPerms" || "perms", {
                configurable: true,
                enumerable: true,
                value: [{ name, optional }],
                writable: true,
            });

            return target;
        }

        Object.defineProperty(target.prototype, bot && "botPerms" || "perms", {
            configurable: true,
            enumerable: true,
            value: target.prototype[bot && "botPerms" || "perms"].push({ name, optional }),
            writable: true,
        });

        return target;
    };
}

/**
 * Adds a subcommand on the command
 *
 * @example @Hibiki.ext.subcommand(MySubcommand)
 * class MyCommand extends Hibiki.Command {
 *
 * @decorator
 * @memberof ext
 * @export
 * @param {new () => Command} Subcommand Command class to use
 * @returns {ClassDecorator}
 */
export function subcommand (Subcommand: new () => Command): ClassDecorator {
    return <T extends Function>(target: T) => { // tslint:disable-line:ban-types
        if (!target.prototype.subcommands) {
            Object.defineProperty(target.prototype, "subcommands", {
                configurable: true,
                enumerable: true,
                value: { [Subcommand.prototype.name]: new Subcommand() },
                writable: true,
            });

            return target;
        }

        target.prototype.subcommands[Subcommand.prototype.name] = new Subcommand();

        Object.defineProperty(target.prototype, "subcommands", {
            configurable: true,
            enumerable: true,
            value: target.prototype.subcommands,
            writable: true,
        });

        return target;
    };
}

/**
 * Sets the command description
 *
 * @example @Hibiki.ext.description("nya", "nya", "nya") // nya nya nya
 * class MyCommand extends Hibiki.Command {
 *
 * @decorator
 * @memberof ext
 * @export
 * @param {...any[]} args Description
 * @returns {ClassDecorator}
 */
export function description (...args: any[]): ClassDecorator {
    return applyMeta("desc", args.join("\n"));
}

/**
 * Sets the command to owner only
 *
 * @decorator
 * @memberof ext
 * @export
 * @returns {ClassDecorator}
 */
export function ownerOnly (): ClassDecorator {
    return applyMeta("ownerOnly", true);
}
