// WebSocket.ts - WebSockets for everyone!!1! (noud02)

import * as crypto from "crypto";
import * as WebSocket from "ws";

export class WebSocketClient {

    public ws: WebSocket;

    constructor (private address: string, private options: WebSocket.IClientOptions) {}

    public connect (): Promise<any> {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.address, this.options);

            this.ws.once("error", reject);
            this.ws.once("listening", resolve);
        });
    }

}
