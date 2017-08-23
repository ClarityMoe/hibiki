/// <reference types="node" />
/// <reference types="ws" />
import { EventEmitter } from "events";
import * as WebSocket from "ws";
import { Logger } from "../client/Logger";
import { IHibikiConfig } from "../Constants";
/**
 * WebSocket Server class
 *
 */
export declare class Server extends EventEmitter {
    private config;
    /**
     * Creates an instance of Server.
     * @param config
     */
    constructor(config: IHibikiConfig);
    /**
     * WebSocket Server
     *
     */
    wss: WebSocket.Server;
    /**
     * Logger
     *
     */
    logger: Logger;
    /**
     * Initializes the server
     *
     * @returns
     */
    init(): Promise<void>;
    /**
     * Closes the server
     *
     * @returns
     */
    close(): Promise<void>;
}
