// Player.ts - Music Player instance (noud02)

import * as Eris from "eris";
import { EventEmitter } from "events";
import { Track } from "./Track";

export class Player extends EventEmitter {

    public queue: Map<Track, string> = new Map<Track, string>();

    constructor (public guild: Eris.Guild) {
        super();
    }

}
