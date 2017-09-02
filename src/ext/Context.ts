// Context.ts - Context for commands (noud02)

import * as Eris from "eris";
import * as fs from "fs";
import * as minimist from "minimist";
import * as path from "path";
import * as tslint from "tslint";
import * as ts from "typescript";
import * as vm from "vm";
import { Shard } from "../client/Shard";

export interface IEvalContext extends vm.Context {
    [key: string]: any;
}

/**
 * Context class
 *
 * @export
 * @class Context
 */
export class Context {

    /**
     * Message author
     * @see https://abal.moe/Eris/docs/User
     *
     * @type {Eris.User}
     */
    public author: Eris.User = this.msg.author;
    /**
     * Channel the message was sent in
     * @see https://abal.moe/Eris/docs/Channel
     * @see https://abal/moe/Eris/docs/GuildChannel
     * @see https://abal.moe/Eris/docs/PrivateChannel
     *
     * @type {(Eris.GuildChannel | Eris.PrivateChannel | Eris.GroupChannel)}
     */
    public channel: Eris.GuildChannel | Eris.PrivateChannel | Eris.GroupChannel = this.msg.channel;
    /**
     * Channel mentions in the message
     *
     * @type {(string[] | undefined)}
     */
    public channelMentions?: string[] | undefined = this.msg.channelMentions;
    /**
     * Content of the message
     *
     * @type {(string | undefined)}
     */
    public content: string | undefined = this.msg.content;
    /**
     * Embeds on the message
     *
     * @type {Eris.Embed[]}
     */
    public embeds: Eris.Embed[] = this.msg.embeds;
    /**
     * Clean message content (<@id> -> @username)
     *
     * @type {(string | undefined)}
     */
    public cleanContent: string | undefined = this.msg.cleanContent;
    /**
     * Guild the message was sent in
     * @see https://abal.moe/Eris/docs/Guild
     *
     * @type {(Eris.Guild | undefined)}
     */
    public guild?: Eris.Guild | undefined = this.msg.channel instanceof Eris.GuildChannel ? this.msg.channel.guild : undefined;
    /**
     * Member that sent the message
     * @see https://abal.moe/Eris/docs/Member
     *
     * @type {(Eris.Member | undefined)}
     */
    public member?: Eris.Member | undefined = this.msg.member;
    /**
     * User mentions in the message
     *
     * @type {Eris.User[]}
     */
    public mentions: Eris.User[] = this.msg.mentions;
    /**
     * When the message was sent
     *
     * @type {number}
     */
    public timestamp: number = this.msg.timestamp;
    /**
     * When the message was last edited
     *
     * @type {(number | undefined)}
     */
    public editedTimestamp: number | undefined = this.msg.editedTimestamp;
    /**
     * Role mentions in the message
     *
     * @type {string[]}
     */
    public roleMentions: string[] = this.msg.roleMentions;
    /**
     * Message content without flags
     *
     * @type {string}
     */
    public suffix: string = this.flags._.join(" ");

    constructor (public shard: Shard, public msg: Eris.Message, public prefix: string, public command: string, public flags: minimist.ParsedArgs, public args: { [key: string]: any }) { }

    /**
     * Sends a message to the channel the message was sent in
     * @example ctx.send("a", "b", "nya") // a b nya
     *
     * @param {...any[]} args Content to send
     * @returns {Promise<Eris.Message>}
     */
    public send (...args: any[]): Promise<Eris.Message> {
        return this.msg.channel.createMessage(args.join(" "));
    }

    /**
     * Send a message like you normally would in Eris
     *
     * @see https://abal.moe/Eris/docs/Channel#function-createMessage
     *
     * @param {Eris.MessageContent} content Content to send
     * @param {Eris.MessageFile} [file] File to send
     * @returns {Promise<Eris.Message>}
     */
    public createMessage (content: Eris.MessageContent, file?: Eris.MessageFile): Promise<Eris.Message> {
        return this.msg.channel.createMessage(content, file);
    }

    /**
     * Sends a codeblock
     *
     * @example ctx.sendCode("ts", "const nya: Nya<awoo> = new Nya<awoo>()")
     *
     * @param {string} type Code language
     * @param {...any[]} code Code to send
     * @returns {Promise<Eris.Message>}
     */
    public sendCode (type: string, ...code: any[]): Promise<Eris.Message> {
        return this.msg.channel.createMessage(`\`\`\`${type}\n${code.join(" ")}\`\`\``);
    }

    /**
     * Advanced (typescript) eval, linter included.
     *
     * @example const myEval = ctx.eval("interface IREEE { bool: boolean; }; const myREEE: IREEE = { bool: true }; myREEE;").eval // myEval = { bool: true }
     *
     * @param {string} code Code to run
     * @param {map} customProps Custom properties to include in the eval context
     * @returns {Promise<any>}
     */
    public async eval (code: string, customProps: { [key: string]: any }): Promise<any> {
        const builtins: string[] = require("repl")._builtinLibs;
        const context: IEvalContext = vm.createContext();

        for (const builtin of builtins) {
            Object.defineProperty(context, builtin, {
                get () {
                    context[builtin] = require(builtin);

                    return require(builtin);
                },
                set (val: any) {
                    delete context[builtin];
                    context[builtin] = val;
                },
                configurable: true,
            });
        }

        Object.defineProperty(context, "process", {
            get () {
                context.process = process;

                return process;
            },
            set (val: any) {
                delete context.process;
                context.process = val;
            },
            configurable: true,
        });

        for (const prop of Object.keys(customProps)) {
            Object.defineProperty(context, prop, {
                get () {
                    context[prop] = customProps[prop];

                    return customProps[prop];
                },
                set (val: any) {
                    delete context[prop];
                    context[prop] = val;
                },
                configurable: true,
            });
        }

        const compilerOptions: ts.CompilerOptions = {
            "target": ts.ScriptTarget.ES5,
            "module": ts.ModuleKind.CommonJS, // tslint:disable-line:object-literal-sort-keys
            "lib": ["es6"],
            "allowJs": false,
            "checkJs": false,
            "removeComments": false,
            "noEmit": false,
            "importHelpers": true,
            "downlevelIteration": true,
            "isolatedModules": false,
            "strict": true,
            "noImplicitAny": true,
            "strictNullChecks": true,
            "noImplicitThis": true,
            "alwaysStrict": false,
            "noUnusedLocals": true,
            "noUnusedParameters": true,
            "noImplicitReturns": true,
            "noFallthroughCasesInSwitch": true,
            "moduleResolution": ts.ModuleResolutionKind.NodeJs,
            "experimentalDecorators": true,
            "emitDecoratorMetadata": true,
            "plugins": [
                {
                    "name": "tslint-language-service",
                },
            ],
        };

        const compilerHost = ts.createCompilerHost(compilerOptions);

        const getSourceFile = compilerHost.getSourceFile;
        compilerHost.getSourceFile = function (fn) {
            if (fn === "eval.ts") {
                return ts.createSourceFile(fn, `${code}\r\n`, ts.ScriptTarget.ES5, false);
            }

            return getSourceFile.apply(this, arguments);
        };

        let output: string = "";

        compilerHost.writeFile = (_fn: string, txt: string) => output += txt;

        const program: ts.Program = ts.createProgram(["eval.ts"], compilerOptions, compilerHost);
        const linter: tslint.Linter = new tslint.Linter({
            fix: false,
            formatter: "json",
        });

        linter.lint("eval.js", `${code}\r\n`, tslint.Configuration.findConfiguration("tslint.json", "../../").results);

        const errs: ts.Diagnostic[] = program.getSyntacticDiagnostics(program.getSourceFile("eval.ts"));

        errs.concat(program.getSemanticDiagnostics(program.getSourceFile("eval.ts")));
        errs.concat(program.getDeclarationDiagnostics(program.getSourceFile("eval.ts")));

        program.emit();

        const out: string = await vm.runInContext(output, context);

        return {
            eval: out,
            ts: {
                errs,
                program,
            },
            tslint: linter.getResult(),
        };
    }

}
