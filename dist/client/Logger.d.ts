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
     * @param {number} date
     * @param {string} type
     * @param {any[]} args
     * @param {boolean} [error]
     * @returns {*}
     */
    private logBase(date, type, args, error?);
    /**
     * Check the args for errors
     *
     * @private
     * @param {any[]} args
     * @returns {Promise<void>}
     */
    private checkArgs(args);
    /**
     * Logs I guess
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    log(...args: any[]): Promise<void>;
    /**
     * Logs something as INFO
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    info(...args: any[]): Promise<void>;
    /**
     * Logs something as OK
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    ok(...args: any[]): Promise<void>;
    /**
     * Logs something as FAIL
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    fail(...args: any[]): Promise<void>;
    /**
     * Logs something as ERR
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     */
    err(...args: any[]): Promise<void>;
    /**
     * Logs something as debug
     *
     * @param args
     * @returns
     */
    debug(...args: any[]): Promise<void>;
    msg(...args: any[]): Promise<void>;
}
