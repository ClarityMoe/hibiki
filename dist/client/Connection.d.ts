/// <reference types="ws" />
/// <reference types="node" />
import { EventEmitter } from "events";
import * as WebSocket from "ws";
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
 * WebSocket connection between shards.
 *
 * @todo fix this cuz noud is a meme
 * @export
 * @class SockConnection
 * @extends {EventEmitter}
 */
export declare class SockConnection extends EventEmitter {
    private shard;
    private ws;
    private wss;
    constructor(shard: Shard);
    private onClientMessage(ws, data);
    private onServerMessage(ws);
    init(): void;
    send(id: number, op: number, d: any, e?: string): Promise<never> | undefined;
    /**
     * Request something from another shard.
     *
     * @param {string} type
     * @param {*} data
     * @param {number} [shard]
     * @returns {Promise<{ data: any, id: number }>}
     * @memberof SockConnection
     */
    request(type: string, data: any, shard?: number): Promise<{
        data: any;
        id: number;
    }>;
    /**
     * Get a guild from another shard.
     *
     * @param {string} id
     * @returns {Promise<{ data: any, id: number }>}
     * @memberof SockConnection
     */
    getGuild(id: string): Promise<{
        data: any;
        id: number;
    }>;
    /**
     * Get a user from another shard.
     *
     * @param {string} id
     * @returns {Promise<{ data: any, id: number }>}
     * @memberof SockConnection
     */
    getUser(id: string): Promise<{
        data: any;
        id: number;
    }>;
}
