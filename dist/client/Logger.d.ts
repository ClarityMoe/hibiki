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
export declare class Logger {
    /**
     * Logger options
     *
     * @private
     * @type {ILoggerOptions}
     * @memberof Logger
     */
    private options;
    /**
     * Shard that initialized the logger (could be null)
     *
     * @private
     * @type {Shard}
     * @memberof Logger
     */
    private shard;
    /**
     * Logger prefix
     *
     * @private
     * @type {string}
     * @memberof Logger
     */
    private prefix;
    /**
     * Chalk instance
     *
     * @private
     * @type {chalk.Chalk}
     * @memberof Logger
     */
    private readonly clk;
    /**
     * Creates an instance of Logger.
     * @param {(Shard | ILoggerOptions)} obj
     * @memberof Logger
     */
    constructor(obj: Shard | ILoggerOptions);
    /**
     * Get a colored prefix based on the name
     *
     * @private
     * @returns {string}
     * @memberof Logger
     */
    private getPrefix();
    /**
     * Get the current time, IN COLOR!!11!
     *
     * @private
     * @param {number} num
     * @returns {string}
     * @memberof Logger
     */
    private getTime(num);
    /**
     * Get a label in color based on the name
     *
     * @private
     * @param {string} type
     * @returns {string}
     * @memberof Logger
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
     * @memberof Logger
     */
    private logBase(date, type, args, error?);
    /**
     * Check the args for errors
     *
     * @private
     * @param {any[]} args
     * @returns {Promise<void>}
     * @memberof Logger
     */
    private checkArgs(args);
    /**
     * Logs I guess
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     * @memberof Logger
     */
    log(...args: any[]): Promise<void>;
    /**
     * Logs something as INFO
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     * @memberof Logger
     */
    info(...args: any[]): Promise<void>;
    /**
     * Logs something as OK
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     * @memberof Logger
     */
    ok(...args: any[]): Promise<void>;
    /**
     * Logs something as FAIL
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     * @memberof Logger
     */
    fail(...args: any[]): Promise<void>;
    /**
     * Logs something as ERR
     *
     * @param {...any[]} args
     * @returns {Promise<void>}
     * @memberof Logger
     */
    err(...args: any[]): Promise<void>;
}
