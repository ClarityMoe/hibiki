"use strict";
// Connection.js - WebSocket Connection between shards (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
// import * as crypto from "crypto";
const events_1 = require("events");
const WebSocket = require("ws"); // Have to use WS here instead of uWS cuz uWS doesnt support custom headers
const Logger_1 = require("./Logger");
/**
 * WebSocket connection between shards
 *
 */
class Connection extends events_1.EventEmitter {
    /**
     * Creates an instance of Connection.
     * @param shard
     */
    constructor(shard) {
        super();
        this.shard = shard;
        /**
         * Logger
         *
         */
        this.logger = new Logger_1.Logger({ prefix: "ws", debug: false });
    }
    /**
     * Connects the WebSocket
     *
     * @returns
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(`ws://${this.shard.options.wss.host || "localhost"}:${this.shard.options.wss.port}`, {
                headers: {
                    id: this.shard.id.toString(),
                    token: this.shard.token,
                },
            });
            this.ws.once("error", reject);
            this.ws.once("open", () => {
                this.ws.ping();
                return resolve();
            });
        });
    }
    /**
     * Send a message to the shards
     *
     * @param op
     * @param d
     * @param [e]
     * @returns
     */
    send(op, d, e) {
        const data = {
            d,
            e,
            op,
        };
        if (this.ws) {
            return Promise.resolve(this.ws.send(JSON.stringify(data)));
        }
        else {
            return Promise.reject(new Error("404 WebSocket not found"));
        }
    }
}
exports.Connection = Connection;
/*
export class SockConnection extends EventEmitter {

    private ws: Map<number, WebSocket> = new Map<number, WebSocket>();
    private wss: WebSocket.Server = new WebSocket.Server();

    constructor (private shard: Shard) {
        super();
    }

    private onmessage (shard: number, msg: string): void {
        let data: IHibikiMessage;
        try {
            data = JSON.parse(msg);
        } catch (e) {
            return e;
        }

        switch (data.op) {
            case OPCodes.MESSAGE: {
                this.emit("MESSAGE", data.d, shard);
                break;
            }

            case OPCodes.RESPONSE: {
                this.emit(`RESPONSE_${data.d.uniqueID}`, data.d.data, shard);
                break;
            }

            case OPCodes.REQUEST: {
                this.emit("REQUEST", data.d.data, (d: any) => {
                    this.send(`RESPONSE_${data.d.uniqueID}`, d, shard);
                });
                break;
            }

            case OPCodes.EVENT: {
                this.emit(`EVENT_${data.e}`, data.d, shard);
                break;
            }

            default: {
                this.emit("UNKNOWN_MESSAGE", data.d, shard);
            }
        }
    }

    private onClientMessage (ws: WebSocket, data: WebSocket.Data): void {
        console.log(data);
    }

    private onServerMessage (ws: WebSocket): void {
        ws.on("message", (data: WebSocket.Data) => this.onClientMessage(ws, data));
    }

    public init () {
        for (const shard of this.shard.options.shards) {
            if (this.shard.id !== shard.id) {
                const ws: WebSocket = new WebSocket(shard.server.host);

                ws.on("message", (data: WebSocket.Data) => this.onClientMessage(ws, data));

                this.ws.set(shard.id, ws);
            }
        }

        this.wss.on("connection", this.onServerMessage);
    }

    public send (id: number, op: number, d: any, e?: string) {

        if (id === this.shard.id) {
            return Promise.reject("REEEEEE");
        }

        if (!this.ws.has(id)) {
            return Promise.reject("Shard not found");
        }

        const ws: WebSocket | undefined = this.ws.get(id);
        const data: IHibikiMessage = {
            d,
            e,
            op,
        };

        if (ws) {
            return Promise.resolve(ws.send(JSON.stringify(data)));
        } else {
            return Promise.reject(new Error("404 WebSocket not found"));
        }
    }

    public request (type: string, data: any, shard?: number): Promise<{ data: any, id: number }> {
        const uniqueID: string = crypto.randomBytes(10).toString();
        for (const id of (shard && [shard] || this.ws.keys())) {
            this.send(id, OPCodes.REQUEST, {
                data,
                type,
                uniqueID,
            });
        }

        return new Promise((resolve, reject) => {

            const res: any[] = [];

            this.on(`RESPONSE_${uniqueID}`, (d: any, id: number) => {
                if (d) {
                    this.removeAllListeners(`RESPONSE_${uniqueID}`);

                    return resolve({ data: d, id });
                }

                if (res.length === this.shard.options.shards.length - 2) {
                    this.removeAllListeners(`RESPONSE_${uniqueID}`);

                    return reject("None of the shards have what you want");
                }

                res.push(d);
            });

        });
    }

    public getGuild (id: string): Promise<{ data: any, id: number }> {
        return this.request("GUILD", { id });
    }

    public getUser (id: string): Promise<{ data: any, id: number }> {
        return this.request("USER", { id });
    }
}*/
