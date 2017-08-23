// Server.ts - WebSocket Server (noud02)

import { EventEmitter } from "events";
import * as http from "http";
import * as WebSocket from "ws";
import { Logger } from "../client/Logger";
import { IHibikiConfig } from "../Constants";

/**
 * WebSocket Server class
 *
 */
export class Server extends EventEmitter {

    /**
     * Creates an instance of Server.
     * @param config
     */
    constructor (private config: IHibikiConfig) {
        super();
    }

    /**
     * WebSocket Server
     *
     */
    public wss: WebSocket.Server;

    /**
     * Logger
     *
     */
    public logger: Logger = new Logger({ prefix: "server", debug: false });

    /**
     * Initializes the server
     *
     * @returns
     */
    public init (): Promise<void> {
        return new Promise((resolve, reject) => {
            this.logger.log("Initializing Server");

            this.wss = new WebSocket.Server({
                port: this.config.wss.port,
                // Make sure the client isn't some random script kid trying to heck up your db
                verifyClient: (info: { origin: string; secure: boolean; req: http.IncomingMessage; }, cb: (res: boolean) => void) => {
                    const token: string | string[] = info.req.headers.token;

                    if (!token) {
                        cb(false);
                    } else {
                        if (token === this.config.token) {
                            cb(true);
                        } else {
                            cb(false);
                        }
                    }
                },
            });

            this.wss.on("connection", (ws: WebSocket, req: http.IncomingMessage) => {

                this.logger.info("New connection:", req.connection.remoteAddress);

                ws.on("message", (data: any) => {
                    const msg: any = JSON.parse(data);

                    this.logger.msg("Message from shard", req.headers.id, "\n\tOP:", msg.op, "\n\tEVENT:", msg.e, "\n\tDATA", msg.d);

                    this.wss.clients.forEach((client: WebSocket) => {
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
    public close (): Promise<void> {
        return new Promise((resolve, reject) => {
            this.wss.close((err: any) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        });
    }
}
