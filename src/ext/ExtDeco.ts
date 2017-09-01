// CommandDeco.ts - Decorators for commands (noud02)

import { Command } from "./Command";

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

export function command (name: string): ClassDecorator {
    return applyMeta("name", name);
}

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
            value: target.prototype.args.push({ name, optional }),
            writable: true,
        });

        return target;
    };
}

export function description (...args: any[]): ClassDecorator {
    return applyMeta("desc", args.join("\n"));
}

export function ownerOnly (): ClassDecorator {
    return applyMeta("ownerOnly", true);
}
