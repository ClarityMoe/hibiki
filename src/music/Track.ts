// Track.ts - Music track (noud02)

import { Writable } from "stream";
import * as nyan from "./NyanDL";

export class Track {

    public stream: Writable = new Writable();

    constructor (public url: string, public quality: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) {}

    public download (): Writable {
        nyan.getStream(this.url).pipe(this.stream);

        return this.stream;
    }

}
