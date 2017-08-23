/// <reference types="node" />
import { EventEmitter } from "events";
import { Shard } from "../client/Shard";
import { Postgres } from "../db/Postgres";
import { Redis } from "../db/Redis";
import { ExtManager } from "./ExtManager";
/**
 * Core of the bot
 *
 */
export declare class Core extends EventEmitter {
    private shard;
    /**
     * Creates an instance of Core.
     * @param {Shard} shard
     */
    constructor(shard: Shard);
    /**
     * Extension manager class
     *
     */
    ext: ExtManager;
    /**
     * Postgres wrapper class
     *
     */
    pg: Postgres;
    /**
     * Redis wrapper class
     *
     */
    r: Redis;
    /**
     * Connect all modules
     *
     * @param {number} timeout
     * @returns {Promise<void>}
     */
    connect(timeout: number): Promise<void>;
    /**
     * Disconnect all modules
     *
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
}
