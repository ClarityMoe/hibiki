// index.ts - export all the things (noud02)


var Promise;
try {
    Promise = require("bluebird"); // tslint:disable-line:no-var-requires
} catch (e) {
    // bluebird was not installed, using native promises instead
    Promise = global.Promise;
}

export { IHibikiOptions, Shard } from "./client/Shard";
export { WebSocketClient } from "./client/WebSocketClient";

export { PostgreSQL } from "./db/PostgreSQL";

import * as ext from "./ext/ExtDeco";
export { ext };

export { Command } from "./ext/Command";
export { CommandHandler } from "./ext/CommandHandler";
export { Context } from "./ext/Context";
export { ExtensionManager } from "./ext/ExtensionManager";
