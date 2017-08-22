/// <reference types="node" />
import { EventEmitter } from "events";
import { Shard } from "../client/Shard";
import { Postgres } from "../db/Postgres";
import { Redis } from "../db/Redis";
import { ExtManager } from "./ExtManager";
/**
 * Core of the bot
 *
 * @export
 * @class Core
 * @extends {EventEmitter}
 */
export declare class Core extends EventEmitter {
    private shard;
    /**
     * Creates an instance of Core.
     * @param {Shard} shard
     * @memberof Core
     */
    constructor(shard: Shard);
    /**
     * Extension manager class
     *
     * @type {ExtManager}
     * @memberof Core
     */
    ext: ExtManager;
    /**
     * Postgres wrapper class
     *
     * @type {Postgres}
     * @memberof Core
     */
    pg: Postgres;
    /**
     * Redis wrapper class
     *
     * @type {Redis}
     * @memberof Core
     */
    r: Redis;
    /**
     * Connect all modules
     *
     * @param {number} timeout
     * @returns {Promise<void>}
     * @memberof Core
     */
    connect(timeout: number): Promise<void>;
    /**
     * Disconnect all modules
     *
     * @returns {Promise<void>}
     * @memberof Core
     */
    disconnect(): Promise<void>;
}
