"use strict";
// Logger.ts - Logger (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const moment = require("moment");
const Shard_1 = require("./Shard");
/**
 * Logger - where all the logging magic happens
 *
 */
class Logger {
    /**
     * Creates an instance of Logger.
     * @param {(Shard | ILoggerOptions)} obj
     */
    constructor(obj) {
        /**
         * Chalk instance
         *
         * @private
         */
        this.clk = new chalk.constructor({ enabled: true });
        if (obj instanceof Shard_1.Shard) {
            this.shard = obj;
            this.options = obj.options.logger;
            this.prefix = "SHARD";
        }
        else {
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
    getPrefix() {
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
     */
    getLabel(type) {
        switch (type) {
            case "info":
                return this.clk.bgMagenta(" INFO ");
            case "msg":
                return this.clk.bgCyan(" MSG ");
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
    logBase(date, type, args, error) {
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
    log(...args) {
        const date = Date.now();
        return this.logBase(date, "log", args, false);
    }
    /**
     * Logs something as INFO
     *
     * @param args
     * @returns
     */
    info(...args) {
        const date = Date.now();
        return this.logBase(date, "info", args, false);
    }
    /**
     * Logs something as OK
     *
     * @param args
     * @returns
     */
    ok(...args) {
        const date = Date.now();
        return this.logBase(date, "ok", args, false);
    }
    /**
     * Logs something as FAIL
     *
     * @param args
     * @returns
     */
    fail(...args) {
        const date = Date.now();
        return this.logBase(date, "fail", args, true);
    }
    /**
     * Logs something as ERR
     *
     * @param args
     * @returns
     */
    err(...args) {
        const date = Date.now();
        return this.logBase(date, "err", args, true);
    }
    /**
     * Logs something as debug
     *
     * @param args
     * @returns
     */
    debug(...args) {
        const date = Date.now();
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
    msg(...args) {
        const date = Date.now();
        return this.logBase(date, "msg", args, false);
    }
}
exports.Logger = Logger;
