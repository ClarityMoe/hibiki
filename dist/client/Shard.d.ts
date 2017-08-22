/// <reference types="node" />
import { Client } from "eris";
import { EventEmitter } from "events";
import { IHibikiConfig } from "../Constants";
import { Core } from "../core/Core";
import { Connection } from "./Connection";
/**
 * Shard class
 *
 */
export declare class Shard extends EventEmitter {
    id: number;
    token: string;
    options: IHibikiConfig;
    /**
     * Logger class
     *
     * @private
     */
    private readonly logger;
    /**
     * Eris options
     *
     * @private
     */
    private erisOptions;
    /**
     * Core
     *
     */
    core: Core | null;
    /**
     * Creates an instance of Shard.
     * @param {string} token
     * @param {IShardOptions} options
     */
    constructor(id: number, token: string, options: IHibikiConfig);
    /**
     * Eris client
     *
     */
    readonly client: Client;
    /**
     * WebSocket connection
     *
     */
    readonly ws: Connection;
    /**
     * Connects the shard and core
     *
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    /**
     * Loads the core (if not loaded)
     *
     * @returns {Promise<Core>}
     */
    loadCore(): Promise<Core>;
    /**
     * Unloads the core (if loaded)
     *
     * @returns {Promise<Core>}
     */
    unloadCore(): Promise<Core>;
    /**
     * Reloads the core
     *
     * @returns {Promise<Core>}
     */
    reloadCore(): Promise<Core>;
}
