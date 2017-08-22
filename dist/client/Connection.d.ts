/// <reference types="node" />
import { EventEmitter } from "events";
import { Shard } from "./Shard";
export interface IHibikiMessage {
    op: number;
    d: any;
    e?: string;
}
export declare class SockConnection extends EventEmitter {
    private shard;
    private ws;
    private wss;
    constructor(shard: Shard);
    private onmessage(shard, msg);
    init(): void;
    send(id: number, op: number, d: any, e?: string): Promise<never> | undefined;
    request(type: string, data: any, shard?: number): Promise<{}>;
    getGuild(id: string): Promise<{}>;
    getUser(id: string): Promise<{}>;
}
