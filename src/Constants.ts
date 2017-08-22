// Constants.js - Constant variables (noud02)

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

export const OPCodes: IOPCodes = {
    EVENT: 0,
    HEARTBEAT: 1,
    MESSAGE: 2,
    REQUEST: 3,
    RESPONSE: 4,
    UPDATE: 5,
};

/**
 * Config
 *
 * @interface IHibikiConfig
 */
export interface IHibikiConfig {
    token: string;
    db: {
        postgres: pg.ClientConfig,
        redis: redis.ClientOpts,
    };
    shards: Array<{
        id: number;
        options: Eris.ClientOptions;
    }>;
    logger: { debug: boolean };
    disabledEvents: string[];
    useENV: boolean;
    wss: IServerOptions;
}
