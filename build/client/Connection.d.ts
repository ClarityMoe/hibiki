/// <reference types="ws" />
/// <reference types="node" />
import { EventEmitter } from "events";
import * as WebSocket from "ws";
import { Logger } from "./Logger";
import { Shard } from "./Shard";
export interface IHibikiMessage {
    op: number;
    d: any;
    e?: string;
}
export interface IWSEvent {
    data: WebSocket.Data;
    type: string;
    target: WebSocket;
}
/**
 * WebSocket connection between shards
 *
 */
export declare class Connection extends EventEmitter {
    private shard;
    /**
     * WebSocket
     *
     */
    ws: WebSocket;
    /**
     * Logger
     *
     */
    readonly logger: Logger;
    /**
     * Creates an instance of Connection.
     * @param shard
     */
    constructor(shard: Shard);
    /**
     * Connects the WebSocket
     *
     * @returns
     */
    connect(): Promise<void>;
    /**
     * Send a message to the shards
     *
     * @param op
     * @param d
     * @param [e]
     * @returns
     */
    send(op: number, d: any, e?: string): Promise<any>;
}
