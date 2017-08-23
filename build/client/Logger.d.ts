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
export declare class Logger {
    /**
     * Logger options
     *
     * @private
     */
    private options;
    /**
     * Shard that initialized the logger (could be null)
     *
     * @private
     */
    private shard;
    /**
     * Logger prefix
     *
     * @private
     */
    private prefix;
    /**
     * Chalk instance
     *
     * @private
     */
    private readonly clk;
    /**
     * Creates an instance of Logger.
     * @param {(Shard | ILoggerOptions)} obj
     */
    constructor(obj: Shard | ILoggerOptions);
    /**
     * Get a colored prefix based on the name
     *
     * @private
     * @returns {string}
     */
    private getPrefix();
    /**
     * Get the current time, IN COLOR!!11!
     *
     * @private
     * @param {number} num
     * @returns {string}
     */
    private getTime(num);
    /**
     * Get a label in color based on the name
     *
     * @private
     * @param {string} type
     * @returns {string}
     */
    private getLabel(type);
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
    private logBase(date, type, args, error?);
    /**
     * Logs I guess
     *
     * @param args
     * @returns
     */
    log(...args: any[]): any;
    /**
     * Logs something as INFO
     *
     * @param args
     * @returns
     */
    info(...args: any[]): any;
    /**
     * Logs something as OK
     *
     * @param args
     * @returns
     */
    ok(...args: any[]): any;
    /**
     * Logs something as FAIL
     *
     * @param args
     * @returns
     */
    fail(...args: any[]): any;
    /**
     * Logs something as ERR
     *
     * @param args
     * @returns
     */
    err(...args: any[]): any;
    /**
     * Logs something as debug
     *
     * @param args
     * @returns
     */
    debug(...args: any[]): any;
    /**
     * Logs a normal message
     *
     * @param args
     * @returns
     */
    msg(...args: any[]): any;
}
