// main.ts - Where all the (client) magic happens (noud02)

import * as minimist from "minimist";
import { IHibikiConfig } from "../Constants";
import { Shard } from "./Shard";

const config: IHibikiConfig = require("../../config.json"); // tslint:disable-line:no-var-requires
const args: minimist.ParsedArgs = minimist(process.argv);

const shard: Shard = new Shard(args.shard || 1, config.token, config);

shard.connect().catch(console.error);

process.on("SIGINT", () => {
    shard.disconnect().catch(console.error);
});
