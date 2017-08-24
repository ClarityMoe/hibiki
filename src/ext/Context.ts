// Context.ts - Context for commands (noud02)

import * as Eris from "eris";
import * as minimist from "minimist";
import * as ts from "typescript";
import * as vm from "vm";
import { Shard } from "../client/Shard";

export interface IEvalContext extends vm.Context {
    [key: string]: any;
}

export class Context {

    public author: Eris.User = this.msg.author;
    public channel: Eris.GuildChannel | Eris.PrivateChannel | Eris.GroupChannel = this.msg.channel;
    public channelMentions?: string[] | undefined = this.msg.channelMentions;
    public guild?: Eris.Guild | undefined = this.msg.channel instanceof Eris.GuildChannel ? this.msg.channel.guild : undefined;
    public member?: Eris.Member | undefined = this.msg.member;
    public mentions: Eris.User[] = this.msg.mentions;
    public timestamp: number = this.msg.timestamp;
    public editedTimestamp: number | undefined = this.msg.editedTimestamp;
    public roleMentions: string[] = this.msg.roleMentions;

    constructor (public shard: Shard, public msg: Eris.Message, public prefix: string, public command: string, public args: minimist.ParsedArgs) {}

    public send (...args: any[]): Promise<Eris.Message> {
        return this.msg.channel.createMessage(args.join(" "));
    }

    public sendCode (type: string, ...code: any[]): Promise<Eris.Message> {
        return this.msg.channel.createMessage(`\`\`\`${type}\n${code.join(" ")}\`\`\``);
    }

    public async eval (code: string, customProps: { [key: string]: any }): Promise<any> {
        const builtins: string[] = require("repl")._builtinLibs;
        const context: IEvalContext = vm.createContext();

        for (const builtin of builtins) {
            Object.defineProperty(context, builtin, {
                get() {
                    context[builtin] = require(builtin);

                    return require(builtin);
                },
                set(val: any) {
                    delete context[builtin];
                    context[builtin] = val;
                },
                configurable: true,
            });
        }

        for (const prop of Object.keys(customProps)) {
            Object.defineProperty(context, prop, {
                get() {
                    context[prop] = customProps[prop];

                    return customProps[prop];
                },
                set(val: any) {
                    delete context[prop];
                    context[prop] = val;
                },
                configurable: true,
            });
        }
        const transpiled: ts.TranspileOutput = ts.transpileModule(code, {
            compilerOptions: {
                target: ts.ScriptTarget.ES2016,
                libs: ["es6"],
                noImplicitAny: true,
                noUnusedParameters: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                allowJs: false,
                strict: true,
                noFallthroughCasesInSwitch: true,
                module: ts.ModuleKind.CommonJS,
                moduleResolution: ts.ModuleResolutionKind.NodeJs,
            },
        });

        return vm.runInContext(transpiled.outputText, context);
    }

}
