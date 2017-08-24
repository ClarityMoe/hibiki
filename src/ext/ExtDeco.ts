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

export function argument (name: string, type: string[], optional: boolean): ClassDecorator {
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

export function description (...args: any[]): ClassDecorator {
    return applyMeta("desc", args.join("\n"));
}

export function ownerOnly (bool: boolean = true) {
    return applyMeta("ownerOnly", bool);
}
