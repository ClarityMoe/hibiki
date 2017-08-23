"use strict";
// Server.ts - WebSocket Server (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const WebSocket = require("ws");
const Logger_1 = require("../client/Logger");
/**
 * WebSocket Server class
 *
 */
class Server extends events_1.EventEmitter {
    /**
     * Creates an instance of Server.
     * @param config
     */
    constructor(config) {
        super();
        this.config = config;
        /**
         * Logger
         *
         */
        this.logger = new Logger_1.Logger({ prefix: "server", debug: false });
    }
    /**
     * Initializes the server
     *
     * @returns
     */
    init() {
        return new Promise((resolve, reject) => {
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
            this.wss.on("connection", (ws, req) => {
                this.logger.info("New connection:", req.connection.remoteAddress);
                ws.on("message", (data) => {
                    const msg = JSON.parse(data);
                    this.logger.msg("Message from shard", req.headers.id, "\n\tOP:", msg.op, "\n\tEVENT:", msg.e, "\n\tDATA", msg.d);
                    this.wss.clients.forEach((client) => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(data);
                        }
                    });
                });
            });
            this.wss.once("error", reject);
            return resolve();
        });
    }
    /**
     * Closes the server
     *
     * @returns
     */
    close() {
        return new Promise((resolve, reject) => {
            this.wss.close((err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }
}
exports.Server = Server;
