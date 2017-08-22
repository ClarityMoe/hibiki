/// <reference types="node" />
import { Client } from "eris";
import { EventEmitter } from "events";
import { ExtManager, IExtManagerOptions } from "../core/ExtManager";
import { IPostgresOptions, Postgres } from "../db/Postgres";
import { SockConnection } from "./Connection";
export interface IShardOptions {
    disabledEvents: string[];
    ext: IExtManagerOptions;
    postgres: IPostgresOptions;
}
export declare class Shard extends EventEmitter {
    private token;
    options: IShardOptions;
    constructor(token: string, options: IShardOptions);
    client: Client;
    postgres: Postgres;
    ext: ExtManager;
    sock: SockConnection;
    connect(): Promise<void>;
}
