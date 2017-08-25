// WebSocketServer.ts - Broadcasting WS Server (noud02)

import { EventEmitter } from "events";
import * as WebSocket from "ws";

export class WebSocketServer {

    public wss: WebSocket.Server;

    constructor (public options: WebSocket.IServerOptions) {}

}
