// Player.ts - Music Player instance (noud02)

import * as Eris from "eris";
import { EventEmitter } from "events";
import { Queue } from "./Queue";
import { Track } from "./Track";

export class Player extends EventEmitter {

    public queue: Queue = new Queue();

    constructor (public guild: Eris.Guild) {
        super();
    }

    public get current (): Track {
        return this.queue.current;
    }

    public async play (channel: Eris.GuildChannel, voice: Eris.GuildChannel): Promise<Track> {
        if (channel.type !== 0) {
            return Promise.reject(new Error("Channel is not a text channel"));
        }

        if (voice.type !== 2) {
            return Promise.reject(new Error("Voicechannel is not a voice channel"));
        }

        return Promise.resolve(this.queue.next());
    }

}
