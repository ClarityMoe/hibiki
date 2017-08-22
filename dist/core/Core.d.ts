/// <reference types="node" />
import { EventEmitter } from "events";
import { Shard } from "../client/Shard";
import { Postgres } from "../db/Postgres";
import { Redis } from "../db/Redis";
import { ExtManager } from "./ExtManager";
export declare class Core extends EventEmitter {
    private shard;
    constructor(shard: Shard);
    ext: ExtManager;
    pg: Postgres;
    r: Redis;
    connect(timeout: number): Promise<void>;
    disconnect(): Promise<void>;
}
