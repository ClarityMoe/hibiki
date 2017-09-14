// Queue.ts - Queue (noud02)

import { EventEmitter } from "events";
import * as nyan from "./NyanDL";
import { Track } from "./Track";

export class Queue extends EventEmitter {

    public tracks: Track[] = [];
    public current: Track | undefined;

    constructor (private max: number = 100) {
        super();
    }

    public next (): Track | undefined {
        const track: Track | undefined = this.tracks.shift();

        this.emit("next", this.tracks[0]);

        return track;
    }

    public add (url: string): Promise<Track | void> {
        if (this.tracks.length <= this.max) {

            let info: nyan.INyanInfo | nyan.INyanInfo[];

            try {
                info = nyan.getInfo(url);
            } catch (e) {
                return Promise.reject(e);
            }

            if (Array.isArray(info)) {
                for (const entry of info) {
                    this.add(entry.webpage_url);
                }

                return Promise.resolve();
            }

            const track: Track = new Track(url);

            this.tracks.push(track);

            this.emit("add", track);

            return Promise.resolve(track);
        } else {
            return Promise.reject(new Error("Queue reached max size!"));
        }
    }

    public pop (): Track | undefined {
        return this.tracks.pop();
    }

    public shift (): Track | undefined {
        return this.tracks.shift();
    }

    public shuffle (): void {
        this.tracks = this.tracks.sort(() => 0.5 - Math.random());
    }
}
