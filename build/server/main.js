"use strict";
// main.ts - Where all the (server) magic happens (noud02)
Object.defineProperty(exports, "__esModule", { value: true });
const cluster = require("cluster");
const os = require("os");
const Logger_1 = require("../client/Logger");
const Server_1 = require("./Server");
const config = require("../../config.json"); // tslint:disable-line:no-var-requires
const logger = new Logger_1.Logger({ prefix: "main", debug: false });
if (cluster.isMaster) {
    for (const _cpu of os.cpus()) {
        cluster.fork();
    }
    cluster.on("online", (worker) => {
        logger.ok("Worker online:", worker.id);
    });
    cluster.on("exit", (worker) => {
        logger.err("Worker", worker.id, "died");
        cluster.fork();
    });
}
else {
    const server = new Server_1.Server(config);
    server.init().catch((e) => logger.err(e));
}
