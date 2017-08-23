/// <reference types="uws" />
import * as Eris from "eris";
import * as pg from "pg";
import * as redis from "redis";
import { IServerOptions } from "uws";
/**
 * WebSocket OP codes
 *
 * @interface IOPCodes
 */
export interface IOPCodes {
    EVENT: number;
    HEARTBEAT: number;
    MESSAGE: number;
    REQUEST: number;
    RESPONSE: number;
    UPDATE: number;
}
export declare const OPCodes: IOPCodes;
/**
 * Config
 *
 * @interface IHibikiConfig
 */
export interface IHibikiConfig {
    token: string;
    db: {
        postgres: pg.ClientConfig;
        redis: redis.ClientOpts;
    };
    shards: Array<{
        id: number;
        options: Eris.ClientOptions;
    }>;
    logger: {
        debug: boolean;
    };
    disabledEvents: string[];
    useENV: boolean;
    wss: IServerOptions;
}
