// Server.ts - Main process (noud02)

import { EventEmitter } from "events";
import * as http from "http";
import * as WebSocket from "uws";
import { Logger } from "../client/Logger";
import { IHibikiConfig } from "../Constants";

export class Server extends EventEmitter {

    constructor (private config: IHibikiConfig) {
        super();
    }

    public wss: WebSocket.Server;
    public logger: Logger = new Logger({ prefix: "server", debug: false });

    public init (): Promise<void> {

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

        this.wss.on("connection", (ws: WebSocket) => {
            ws.on("message", (data: any) => {
                const msg: any = JSON.parse(data);

                this.logger.msg("Message from shard", ws.upgradeReq.headers.id, "\n\tOP:", msg.op, "\n\tEVENT:", msg.e, "\n\tDATA", msg.d).catch(console.error);

                this.wss.clients.forEach((client: WebSocket) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(data);
                    }
                });
            });
        });
    }

}
