// index.ts - export all the things (noud02)

try {
    global.Promise = require("bluebird"); // tslint:disable-line:no-var-requires
} catch (e) { // tslint:disable-line:no-empty
}

export { IHibikiOptions, Shard } from "./client/Shard";
export { WebSocketClient } from "./client/WebSocketClient";
export { Logger } from "./client/Logger";

export { PostgreSQL } from "./db/PostgreSQL";

import * as ext from "./ext/ExtDeco";
export { ext };

export { Command } from "./ext/Command";
export { CommandHandler } from "./ext/CommandHandler";
export { Context } from "./ext/Context";
export { ExtensionManager } from "./ext/ExtensionManager";
export { Ratelimiter } from "./ext/Ratelimiter";

export { LocaleManager } from "./locale/LocaleManager";
