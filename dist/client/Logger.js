"use strict";
// Logger.ts - Logger (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const moment = require("moment");
const Shard_1 = require("./Shard");
/**
 * Logger - where all the logging magic happens
 *
 * @export
 * @class Logger
 */
class Logger {
    /**
     * Creates an instance of Logger.
     * @param {(Shard | ILoggerOptions)} obj
     * @memberof Logger
     */
    constructor(obj) {
        /**
         * Chalk instance
         *
         * @private
         * @type {chalk.Chalk}
         * @memberof Logger
         */
        this.clk = new chalk.constructor({ enabled: true });
        if (obj instanceof Shard_1.Shard) {
            this.shard = obj;
            this.options = obj.options.logger;
            this.prefix = "SHARD";
        }
        else {
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
    getPrefix() {
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
    getTime(num) {
        const date = this.clk.cyan(moment(num).format("l"));
        const time = this.clk.cyan(moment(num).format("hh:MM:SS"));
        const m = (str) => this.clk.magenta.bold(str);
        return `${m("[")} ${date} ${m("@")} ${time} ${m("]")}`;
    }
    /**
     * Get a label in color based on the name
     *
     * @private
     * @param {string} type
     * @returns {string}
     * @memberof Logger
     */
    getLabel(type) {
        switch (type) {
            case "info":
                return this.clk.bgMagenta(" INFO ");
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
    logBase(date, type, args, error) {
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
    checkArgs(args) {
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
    log(...args) {
        const date = Date.now();
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
    info(...args) {
        const date = Date.now();
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
    ok(...args) {
        const date = Date.now();
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
    fail(...args) {
        const date = Date.now();
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
    err(...args) {
        const date = Date.now();
        return new Promise((resolve) => {
            // const args: any[] = Array.from(arguments);
            return resolve(this.logBase(date, "err", args, true));
        });
    }
}
exports.Logger = Logger;
