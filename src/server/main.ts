// main.ts - Where all the (server) magic happens (noud02)

import * as cluster from "cluster";
import * as os from "os";
import { Logger } from "../client/Logger";
import { Server } from "./Server";

const config = require("../../config.json"); // tslint:disable-line:no-var-requires
const logger: Logger = new Logger({ prefix: "main", debug: false });

if (cluster.isMaster) {
    for (const _cpu of os.cpus()) {
        cluster.fork();
    }

    cluster.on("online", (worker: cluster.Worker) => {
        logger.ok("Worker online:", worker.id).catch(console.error);
    });

    cluster.on("exit", (worker: cluster.Worker) => {
        logger.err("Worker", worker.id, "died").catch(console.error);
        cluster.fork();
    });
} else {
    const server: Server = new Server(config);

    server.init();
}
