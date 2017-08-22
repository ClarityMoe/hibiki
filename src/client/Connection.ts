// Connection.js - WebSocket Connection between shards (noud02)

import * as crypto from "crypto";
import { EventEmitter } from "events";
import * as WebSocket from "ws";
import { OPCodes } from "../Constants";
import { Shard } from "./Shard";

export interface IHibikiMessage {
    op: number;
    d: any;
    e?: string;
}

export interface IWSEvent {
    data: WebSocket.Data;
    type: string;
    target: WebSocket;
}
/**
 * WebSocket connection between shards.
 *
 * @todo fix this cuz noud is a meme
 * @export
 * @class SockConnection
 * @extends {EventEmitter}
 */
export class SockConnection extends EventEmitter {

    private ws: Map<number, WebSocket> = new Map<number, WebSocket>();
    private wss: WebSocket.Server = new WebSocket.Server();

    constructor (private shard: Shard) {
        super();
    }

    /*
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
    */

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

    /**
     * Request something from another shard.
     *
     * @param {string} type
     * @param {*} data
     * @param {number} [shard]
     * @returns {Promise<{ data: any, id: number }>}
     * @memberof SockConnection
     */
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

    /**
     * Get a guild from another shard.
     *
     * @param {string} id
     * @returns {Promise<{ data: any, id: number }>}
     * @memberof SockConnection
     */
    public getGuild (id: string): Promise<{ data: any, id: number }> {
        return this.request("GUILD", { id });
    }

    /**
     * Get a user from another shard.
     *
     * @param {string} id
     * @returns {Promise<{ data: any, id: number }>}
     * @memberof SockConnection
     */
    public getUser (id: string): Promise<{ data: any, id: number }> {
        return this.request("USER", { id });
    }
}
