"use strict";
// Server.ts - Main process (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const WebSocket = require("uws");
const Logger_1 = require("../client/Logger");
class Server extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.logger = new Logger_1.Logger({ prefix: "server", debug: false });
    }
    init() {
        this.logger.log("Initializing Server");
        this.wss = new WebSocket.Server({
            port: this.config.wss.port,
            // Make sure the client isn't some random script kid trying to heck up your db
            verifyClient: (info, cb) => {
                const token = info.req.headers.token;
                if (!token) {
                    cb(false);
                }
                else {
                    if (token === this.config.token) {
                        cb(true);
                    }
                    else {
                        cb(false);
                    }
                }
            },
        });
        this.wss.on("connection", (ws) => {
            ws.on("message", (data) => {
                const msg = JSON.parse(data);
                this.logger.msg("Message from shard", ws.upgradeReq.headers.id, "\n\tOP:", msg.op, "\n\tEVENT:", msg.e, "\n\tDATA", msg.d).catch(console.error);
                this.wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(data);
                    }
                });
            });
        });
    }
}
exports.Server = Server;
