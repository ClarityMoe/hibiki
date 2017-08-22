// Logger.ts - Logger (noud02)

import * as chalk from "chalk";
import * as moment from "moment";
import { Shard } from "./Shard";

/**
 * Options for the logger
 *
 * @export
 * @interface ILoggerOptions
 */
export interface ILoggerOptions {
    prefix?: string;
    debug?: boolean;
}

/**
 * Logger - where all the logging magic happens
 *
 * @export
 * @class Logger
 */
export class Logger {

    /**
     * Logger options
     *
     * @private
     * @type {ILoggerOptions}
     * @memberof Logger
     */
    private options: ILoggerOptions;

    /**
     * Shard that initialized the logger (could be null)
     *
     * @private
     * @type {Shard}
     * @memberof Logger
     */
    private shard: Shard;

    /**
     * Logger prefix
     *
     * @private
     * @type {string}
     * @memberof Logger
     */
    private prefix: string;

    /**
     * Chalk instance
     *
     * @private
     * @type {chalk.Chalk}
     * @memberof Logger
     */
    private readonly clk: chalk.Chalk = new chalk.constructor({ enabled: true });

    /**
     * Creates an instance of Logger.
     * @param {(Shard | ILoggerOptions)} obj
     * @memberof Logger
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
     * @memberof Logger
     */
    private getPrefix (): string {
        switch (this.prefix.toLowerCase()) {
            case "main":
                return this.clk.blue(this.prefix);
            case "core":
                return this.clk.cyan(this.prefix);
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
     * @memberof Logger
     */
    private getTime (num: number): string {
        const date: string = this.clk.cyan(moment(num).format("l"));
        const time: string = this.clk.cyan(moment(num).format("hh:MM:SS"));
        const b: (str: string) => string = (str: string) => this.clk.blue.bold(str);

        return `${b("[")} ${date} ${b("@")} ${time} ${b("]")}`;
    }

    /**
     * Get a label in color based on the name
     *
     * @private
     * @param {string} type
     * @returns {string}
     * @memberof Logger
     */
    private getLabel (type: string): string {
        switch (type) {
            case "info":
                return this.clk.bgPurple(" INFO ");
            case "ok":
                return this.clk.bgGreen(" OK ");
            case "fail":
                return this.clk.bgRed(" FAIL ");
            case "err":
                return this.clk.bgRed(" ERR ");
            case "log":
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
     * @memberof Logger
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
     * @memberof Logger
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
     * @memberof Logger
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
     * @memberof Logger
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
     * @memberof Logger
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
     * @memberof Logger
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
     * @memberof Logger
     */
    public err (...args: any[]): Promise<void> {
        const date: number = Date.now();

        return new Promise((resolve) => {
            // const args: any[] = Array.from(arguments);
            return resolve(this.logBase(date, "err", args, true));
        });
    }

}
