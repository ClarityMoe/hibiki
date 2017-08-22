/// <reference types="node" />
import { Client } from "eris";
import { EventEmitter } from "events";
import { Core } from "../core/Core";
import { IExtManagerOptions } from "../core/ExtManager";
import { IPostgresOptions } from "../db/Postgres";
import { IRedisOptions } from "../db/Redis";
import { SockConnection } from "./Connection";
export interface IShardOptions {
    database: {
        postgres: IPostgresOptions;
        redis: IRedisOptions;
    };
    shards: Array<{
        id: number;
        server: {
            host: string;
        };
    }>;
    logger: {
        debug: boolean;
    };
    disabledEvents: string[];
    ext: IExtManagerOptions;
}
export declare class Shard extends EventEmitter {
    private token;
    options: IShardOptions;
    private readonly logger;
    private erisOptions;
    core: Core | null;
    constructor(token: string, options: IShardOptions);
    readonly client: Client;
    readonly ws: SockConnection;
    connect(): Promise<void>;
    loadCore(): Promise<Core>;
    unloadCore(): Promise<Core>;
    reloadCore(): Promise<Core>;
}
