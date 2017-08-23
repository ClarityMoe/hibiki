// Logger.ts - Logger (noud02)

import * as chalk from "chalk";
import * as moment from "moment";
import { Shard } from "./Shard";

/**
 * Options for the logger
 *
 * @interface ILoggerOptions
 */
export interface ILoggerOptions {
    prefix?: string;
    debug?: boolean;
}

/**
 * Logger - where all the logging magic happens
 *
 */
export class Logger {

    /**
     * Logger options
     *
     * @private
     */
    private options: ILoggerOptions;

    /**
     * Shard that initialized the logger (could be null)
     *
     * @private
     */
    private shard: Shard;

    /**
     * Logger prefix
     *
     * @private
     */
    private prefix: string;

    /**
     * Chalk instance
     *
     * @private
     */
    private readonly clk: chalk.Chalk = new chalk.constructor({ enabled: true });

    /**
     * Creates an instance of Logger.
     * @param {(Shard | ILoggerOptions)} obj
     */
    constructor (obj: Shard | ILoggerOptions) {
        if (obj instanceof Shard) {
            this.shard = obj;
            this.options = obj.options.logger;
            this.prefix = "SHARD";
        } else {
            this.options = obj;
            this.prefix = obj.prefix && obj.prefix.toUpperCase().substring(0, 5) || "UNKNOWN";
        }
    }

    /**
     * Get a colored prefix based on the name
     *
     * @private
     * @returns {string}
     */
    private getPrefix (): string {
        switch (this.prefix.toLowerCase()) {
            case "main":
                return this.clk.blue(this.prefix);
            case "core":
                return this.clk.cyan(this.prefix);
            case "server":
                return this.clk.magenta(this.prefix);
            default:
                return this.clk.yellow(this.prefix);
        }
    }

    /**
     * Get the current time, IN COLOR!!11!
     *
     * @private
     * @param {number} num
     * @returns {string}
     */
    private getTime (num: number): string {
        const date: string = this.clk.cyan(moment(num).format("l"));
        const time: string = this.clk.cyan(moment(num).format("hh:MM:SS"));
        const m: (str: string) => string = (str: string) => this.clk.magenta.bold(str);

        return `${m("[")} ${date} ${m("@")} ${time} ${m("]")}`;
    }

    /**
     * Get a label in color based on the name
     *
     * @private
     * @param {string} type
     * @returns {string}
     */
    private getLabel (type: string): string {
        switch (type) {
            case "info":
                return this.clk.bgMagenta(" INFO ");
            case "msg":
                return this.clk. bgCyan(" MSG ");
            case "ok":
                return this.clk.bgGreen(" OK ");
            case "fail":
                return this.clk.bgRed(" FAIL ");
            case "err":
                return this.clk.bgRed(" ERR ");
            case "log":
            case "debug":
            default:
                return this.clk.black.bgWhite(" LOG ");
        }
    }

    /**
     * Base for logging
     *
     * @private
     * @param date
     * @param type
     * @param args
     * @param [error]
     * @returns
     */
    private logBase (date: number, type: string, args: any[], error?: boolean): any {
        const prefix = this.getPrefix();
        const time = this.getTime(date);
        const label = this.getLabel(type);

        return console[error && "error" || "log"](prefix, time, label, args.join(" "));
    }

    /**
     * Logs I guess
     *
     * @param args
     * @returns
     */
    public log (...args: any[]): any {
        const date: number = Date.now();

        return this.logBase(date, "log", args, false);
    }

    /**
     * Logs something as INFO
     *
     * @param args
     * @returns
     */
    public info (...args: any[]): any {
        const date: number = Date.now();

        return this.logBase(date, "info", args, false);
    }

    /**
     * Logs something as OK
     *
     * @param args
     * @returns
     */
    public ok (...args: any[]): any {
        const date: number = Date.now();

        return this.logBase(date, "ok", args, false);
    }

    /**
     * Logs something as FAIL
     *
     * @param args
     * @returns
     */
    public fail (...args: any[]): any {
        const date: number = Date.now();

        return this.logBase(date, "fail", args, true);
    }

    /**
     * Logs something as ERR
     *
     * @param args
     * @returns
     */
    public err (...args: any[]): any {
        const date: number = Date.now();

        return this.logBase(date, "err", args, true);
    }

    /**
     * Logs something as debug
     *
     * @param args
     * @returns
     */
    public debug (...args: any[]): any {
        const date: number = Date.now();

        if (!this.options.debug) {
            return;
        }

        return this.logBase(date, "debug", args, false);
    }

    /**
     * Logs a normal message
     *
     * @param args
     * @returns
     */
    public msg (...args: any[]): any {
        const date: number = Date.now();

        return this.logBase(date, "msg", args, false);
    }

}
