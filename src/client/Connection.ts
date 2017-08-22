import * as crypto from "crypto";
import { EventEmitter } from "events";
import * as WebSocket from "uws";
import * as config from "../config";
import { OPCodes } from "../Constants";
import { Shard } from "./Shard";

export interface IHibikiMessage {
    op: number;
    d: any;
    e?: string;
}

export class SockConnection extends EventEmitter {

    private ws: Map<number, WebSocket> = new Map<number, WebSocket>();
    private wss: WebSocket.Server = new WebSocket.Server();

    constructor(private shard: Shard) {
        super();
    }

    private onmessage(shard: number, msg: string) {
        let data: IHibikiMessage;
        try {
            data = JSON.parse(msg);
        } catch (e) {
            return Promise.reject(e);
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
                break;
            }
        }
    }

    public init() {
        for (const shard of config.shards) {
            if (this.shard.id !== shard.id) {
                const ws: WebSocket = new WebSocket(shard.server.ip);
                ws.onmessage = this.onmessage;
                this.ws.set(shard.id, ws);
            }
        }

        this.wss.on("message", this.onmessage);
    }

    public send(id: number, op: number, d: any, e?: string) {

        if (id === this.shard.id) {
            return Promise.reject("REEEEEE");
        }

        if (!this.ws.has(id)) {
            return Promise.reject("Shard not found");
        }

        const ws: WebSocket = this.ws.get(id);
        const data: IHibikiMessage = {
            d,
            e: e || null,
            op,
        };

        ws.send(JSON.stringify(data));
    }

    public request(type: string, data: any, shard?: number) {
        const uniqueID: string = crypto.randomBytes(10).toString();
        for (const id of (shard && [shard] || this.ws.entries())) {
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

                if (res.length === config.shards.length - 2) {
                    this.removeAllListeners(`RESPONSE_${uniqueID}`);
                    return reject("None of the shards have what you want");
                }

                res.push(d);
            });

        });
    }

    public getGuild(id: string) {
        return this.request("GUILD", { id });
    }

    public getUser(id: string) {
        return this.request("USER", { id });
    }
}
