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
            this.prefix = obj.prefix || "UNKNOWN";
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
     * @param {number} date
     * @param {string} type
     * @param {any[]} args
     * @param {boolean} [error]
     * @returns {*}
     */
    private logBase (date: number, type: string, args: any[], error?: boolean): any {
        const prefix = this.getPrefix();
        const time = this.getTime(date);
        const label = this.getLabel(type);

        return console[error && "error" || "log"](prefix, time, label, args.join(" "));
    }

    /**
     * Check the args for errors
     *
     * @private
     * @param {any[]} args
     * @returns {Promise<void>}
     */
    private checkArgs (args: any[]): Promise<void> {
        for (const arg of args) {
            if (arg instanceof Error) {
                return Promise.reject(new Error("Logging errors under non-error types is NOT allowed!"));
            }
        }

        return Promise.resolve();
    }

    /**
     * Logs I guess
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    public log (...args: any[]): Promise<void> {
        const date: number = Date.now();

        return new Promise((resolve, reject) => {
            // const args: any[] = Array.from(arguments); - IK this is faster but I don't want TS to be a bitch
            this.checkArgs(args).catch(reject);

            return resolve(this.logBase(date, "log", args, false));
        });
    }

    /**
     * Logs something as INFO
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    public info (...args: any[]): Promise<void> {
        const date: number = Date.now();

        return new Promise((resolve, reject) => {
            // const args: any[] = Array.from(arguments);
            this.checkArgs(args).catch(reject);

            return resolve(this.logBase(date, "info", args, false));
        });
    }

    /**
     * Logs something as OK
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    public ok (...args: any[]): Promise<void> {
        const date: number = Date.now();

        return new Promise((resolve, reject) => {
            // const args: any[] = Array.from(arguments);
            this.checkArgs(args).catch(reject);

            return resolve(this.logBase(date, "ok", args, false));
        });
    }

    /**
     * Logs something as FAIL
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    public fail (...args: any[]): Promise<void> {
        const date: number = Date.now();

        return new Promise((resolve) => {
            // const args: any[] = Array.from(arguments);
            return resolve(this.logBase(date, "fail", args, true));
        });
    }

    /**
     * Logs something as ERR
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    public err (...args: any[]): Promise<void> {
        const date: number = Date.now();

        return new Promise((resolve) => {
            // const args: any[] = Array.from(arguments);
            return resolve(this.logBase(date, "err", args, true));
        });
    }

    /**
     * Logs something as debug
     *
     * @param args
     * @returns
     */
    public debug (...args: any[]): Promise<void> {
        const date: number = Date.now();

        return new Promise((resolve) => {
            // const args: any[] = Array.from(arguments);
            if (!this.options.debug) {
                return resolve();
            }

            return resolve(this.logBase(date, "debug", args, true));
        });
    }

    public msg (...args: any[]): Promise<void> {
        const date: number = Date.now();

        return new Promise((resolve, reject) => {
            // const args: any[] = Array.from(arguments);

            this.checkArgs(args).catch(reject);

            return resolve(this.logBase(date, "msg", args, false));
        });
    }

}
