// Logger.ts - Logger (noud02)

import { Chalk, constructor as ChalkClass } from "chalk";
import * as Eris from "eris";
import * as moment from "moment";

const clk: Chalk = new ChalkClass({ enabled: true });

/**
 * Logger
 *
 * @param {string} prefix Prefix to use
 * @param {boolean} debugMode Enable debug mode
 * @export
 * @class Logger
 */
export class Logger {
    constructor (private prefix: string, private debugMode: boolean = false) {}

    /**
     * Normal log
     *
     * @param {...any[]} args
     * @returns {void}
     */
    public log (...args: any[]): void {
        return console.log(this.base("log", ...args));
    }

    /**
     * Logs as error
     *
     * @param {...any[]} args
     * @returns {void}
     */
    public err (...args: any[]): void {
        return console.error(this.base("err", ...args));
    }

    /**
     * Logs as debug (only if debug mode is enabled)
     *
     * @param {...any[]} args
     * @returns {void}
     */
    public debug (...args: any[]): void {
        if (this.debugMode) {
            return console.log(this.base("debug", ...args));
        }
    }

    /**
     * Logs as fail
     *
     * @param {...any[]} args
     * @returns {void}
     */
    public fail (...args: any[]): void {
        return console.error(this.base("fail", ...args));
    }

    /**
     * Logs as info
     *
     * @param {...any[]} args
     * @returns {void}
     */
    public info (...args: any[]): void {
        return console.info(this.base("info", ...args));
    }

    /**
     * Logs as ok
     *
     * @param {...any[]} args
     * @returns {void}
     */
    public ok (...args: any[]): void {
        return console.log(this.base("ok", ...args));
    }

    /**
     * Logs a message
     *
     * @param {Eris.Message} msg
     * @returns {void}
     */
    public msg (msg: Eris.Message): void {
        const str: string[] = [];

        if (msg.channel instanceof Eris.GuildChannel) {
            str.push(clk.bold.magenta(msg.channel.guild.name));
            str.push("->");
            str.push(clk.bold.cyan(msg.channel.name));
            str.push("->");
        }

        str.push(clk.bold.green(`${msg.author.username}#${msg.author.discriminator}`));
        str.push("->");
        str.push(msg.cleanContent || clk.italic.dim("empty"));

        return console.log(this.base("msg", ...str));
    }

    /**
     * Get a colored label based on type
     *
     * @private
     * @param {string} type
     * @returns {string}
     */
    private getLabel (type: string): string {
        switch (type) {
            case "info":
                return clk.bgMagenta(" INF ");
            case "msg":
                return clk. bgCyan(" MSG ");
            case "ok":
                return clk.bgGreen(" OK! ");
            case "fail":
                return clk.bgRed(" FAI ");
            case "err":
                return clk.bgRed(" ERR ");
            case "debug":
                return clk.black.bgWhite(" DBG ");
            case "log":
            default:
                return clk.black.bgWhite(" LOG ");
        }
    }

    /**
     * Base log thing
     *
     * @private
     * @param {string} type
     * @param {...any[]} args
     * @returns {string}
     */
    private base (type: string, ...args: any[]): string {
        const date: string = clk.cyan(moment().format("L"));
        const time: string = clk.cyan(moment().format("LTS"));
        const m: (str: string) => string = (str: string) => clk.magenta.bold(str);
        const now = `${m("[")} ${date} ${m("@")} ${time} ${m("]")}`;

        const prefix = clk.yellow(this.prefix);

        const label = this.getLabel(type);

        return `${prefix} ${now} ${label} ${args.join(" ")}`;
    }
}
