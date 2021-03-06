// Track.ts - Music track (noud02)

import { Readable } from "stream";
import * as nyan from "./NyanDL";

export interface ITrackInfo {
    title: string;
    artist: string;
    url: string;
    source: string;
    thumbnail: string;
}

export class Track {

    public stream: Readable = new Readable();

    constructor (public url: string) {}

    public download (): Readable {
        this.stream = nyan.getStream(this.url);

        return this.stream;
    }

    public get info (): ITrackInfo {
        try {
            const data: nyan.INyanInfo | nyan.INyanInfo[] = nyan.getInfo(this.url);

            if (Array.isArray(data)) {
                throw new Error("Track is a playlist!");
            }

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
