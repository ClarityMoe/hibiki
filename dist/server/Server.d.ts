/// <reference types="node" />
/// <reference types="uws" />
import { EventEmitter } from "events";
import * as WebSocket from "uws";
import { Logger } from "../client/Logger";
import { IHibikiConfig } from "../Constants";
export declare class Server extends EventEmitter {
    private config;
    constructor(config: IHibikiConfig);
    wss: WebSocket.Server;
    logger: Logger;
    init(): Promise<void>;
}
