// Queue.ts - Queue (noud02)

import { Track } from "./Track";

export class Queue extends EventEmitter {

    public tracks: Track[] = [];

    constructor (private max: number = 100) {
        super();
    }

    public skip (): Track | undefined {
        const track: Track | undefined = this.tracks.pop();

        this.emit("next", this.tracks[0]);

        return track;
    }

    public add (url: string): Promise<Track> {
        if (this.tracks.length <= this.max) {
            const track: Track = new Track(url, 0);

            this.tracks.push(track);
        } else {
            return Promise.reject(new Error("Queue reached max size!"));
        }
    }
}
