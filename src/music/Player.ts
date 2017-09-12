// Player.ts - Music Player instance (noud02)

import * as Eris from "eris";
import { EventEmitter } from "events";
import { Queue } from "./Queue";
import { Track } from "./Track";

export class Player extends EventEmitter {

    public queue: Queue = new Queue();
    public current: Track | undefined;

    constructor (public guild: Eris.Guild) {
        super();
    }

}
