// Track.ts - Music track (noud02)

import { Writable } from "stream";
import * as nyan from "./NyanDL";

export interface ITrackInfo {
    title: string;
    artist: string;
    url: string;
    source: string;
    thumbnail: string;
}

export class Track {

    public stream: Writable = new Writable();

    constructor (public url: string) {}

    public download (): Writable {
        nyan.getStream(this.url).pipe(this.stream);

        return this.stream;
    }

    public get info (): ITrackInfo {
        try {
            const data: nyan.INyanInfo = nyan.getInfo(this.url);

            return {
                artist: data.uploader,
                source: data.extractor,
                thumbnail: data.thumbnail,
                title: data.title,
                url: this.url,
            };
        } catch (e) {
            throw e;
        }
    }

}
