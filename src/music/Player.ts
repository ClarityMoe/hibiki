// Player.ts - Music Player instance (noud02)

import * as Eris from "eris";
import { EventEmitter } from "events";

export class Player extends EventEmitter {

    public queue: Queue = new Queue();

    constructor (public guild: Eris.Guild) {
        super();
    }

}
