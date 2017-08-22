"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const events_1 = require("events");
const WebSocket = require("uws");
const config = require("../config");
const Constants_1 = require("../Constants");
class SockConnection extends events_1.EventEmitter {
    constructor(shard) {
        super();
        this.shard = shard;
        this.ws = new Map();
        this.wss = new WebSocket.Server();
    }
    onmessage(shard, msg) {
        let data;
        try {
            data = JSON.parse(msg);
        }
        catch (e) {
            return Promise.reject(e);
        }
        switch (data.op) {
            case Constants_1.OPCodes.MESSAGE: {
                this.emit("MESSAGE", data.d, shard);
                break;
            }
            case Constants_1.OPCodes.RESPONSE: {
                this.emit(`RESPONSE_${data.d.uniqueID}`, data.d.data, shard);
                break;
            }
            case Constants_1.OPCodes.REQUEST: {
                this.emit("REQUEST", data.d.data, (d) => {
                    this.send(`RESPONSE_${data.d.uniqueID}`, d, shard);
                });
                break;
            }
            case Constants_1.OPCodes.EVENT: {
                this.emit(`EVENT_${data.e}`, data.d, shard);
                break;
            }
            default: {
                this.emit("UNKNOWN_MESSAGE", data.d, shard);
                break;
            }
        }
    }
    init() {
        for (const shard of config.shards) {
            if (this.shard.id !== shard.id) {
                const ws = new WebSocket(shard.server.ip);
                ws.onmessage = this.onmessage;
                this.ws.set(shard.id, ws);
            }
        }
        this.wss.on("message", this.onmessage);
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
    request(type, data, shard) {
        const uniqueID = crypto.randomBytes(10).toString();
        for (const id of (shard && [shard] || this.ws.entries())) {
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
    getGuild(id) {
        return this.request("GUILD", { id });
    }
    getUser(id) {
        return this.request("USER", { id });
    }
}
exports.SockConnection = SockConnection;
