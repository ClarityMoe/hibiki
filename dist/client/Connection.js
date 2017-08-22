"use strict";
// Connection.js - WebSocket Connection between shards (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const events_1 = require("events");
const WebSocket = require("ws");
const Constants_1 = require("../Constants");
/**
 * WebSocket connection between shards.
 *
 * @todo fix this cuz noud is a meme
 * @export
 * @class SockConnection
 * @extends {EventEmitter}
 */
class SockConnection extends events_1.EventEmitter {
    constructor(shard) {
        super();
        this.shard = shard;
        this.ws = new Map();
        this.wss = new WebSocket.Server();
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
    onClientMessage(ws, data) {
        console.log(data);
    }
    onServerMessage(ws) {
        ws.on("message", (data) => this.onClientMessage(ws, data));
    }
    init() {
        for (const shard of this.shard.options.shards) {
            if (this.shard.id !== shard.id) {
                const ws = new WebSocket(shard.server.ip);
                this.ws.set(shard.id, ws);
            }
        }
        this.wss.on("connection", this.onServerMessage);
    }
    send(id, op, d, e) {
        if (id === this.shard.id) {
            return Promise.reject("REEEEEE");
        }
        if (!this.ws.has(id)) {
            return Promise.reject("Shard not found");
        }
        const ws = this.ws.get(id);
        const data = {
            d,
            e: e || null,
            op,
        };
        ws.send(JSON.stringify(data));
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
    request(type, data, shard) {
        const uniqueID = crypto.randomBytes(10).toString();
        for (const id of (shard && [shard] || this.ws.keys())) {
            this.send(id, Constants_1.OPCodes.REQUEST, {
                data,
                type,
                uniqueID,
            });
        }
        return new Promise((resolve, reject) => {
            const res = [];
            this.on(`RESPONSE_${uniqueID}`, (d, id) => {
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
    /**
     * Get a guild from another shard.
     *
     * @param {string} id
     * @returns {Promise<{ data: any, id: number }>}
     * @memberof SockConnection
     */
    getGuild(id) {
        return this.request("GUILD", { id });
    }
    /**
     * Get a user from another shard.
     *
     * @param {string} id
     * @returns {Promise<{ data: any, id: number }>}
     * @memberof SockConnection
     */
    getUser(id) {
        return this.request("USER", { id });
    }
}
exports.SockConnection = SockConnection;
