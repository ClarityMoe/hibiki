// NyanDL.ts - YTDL Wrapper (noud02)

import { ChildProcess, execSync, spawn } from "child_process";
import { Writable } from "stream";

export interface INyanInfo {
    id: string;
    uploader: string;
    upload_date: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: number;
    webpage_url: string;
    license: string;
    formats: Array<{ [key: string]: any }>;
    extractor: string;
    extractor_key: string;
    playlist: null | Array<{ [key: string]: any }>;
    playlist_index: null | number;
    thumbnails: Array<{
        url: string;
        id: string;
    }>;
    fulltitle: string;
}

export function getStream (url: string): Writable {
    const stream: Writable = new Writable();

    const ytdl: ChildProcess = spawn("youtube-dl", [url, "-q", "-o", "-"]);
    const flac: ChildProcess = spawn("flac", ["-0", "-", "-"]);

    ytdl.stdout.pipe(flac.stdin);
    flac.stdout.pipe(stream);

    return stream;
}

export function getInfo (url: string): INyanInfo | INyanInfo[] {
    let res: string = execSync(`youtube-dl ${url} -j`).toString().trim();

    if (res.indexOf("\n") > -1) {
        res = `[${res.split("\n").join(",")}]`;
    }

    try {
        return JSON.parse(res);
    } catch (e) {
        throw e;
    }
}

export function search (query: string, provider: string = "ytsearch"): INyanInfo {
    const res: string = execSync(`youtube-dl '${provider}:${query.replace(/'/g, "\\'")}' -j`).toString();

    try {
        return JSON.parse(res);
    } catch (e) {
        throw e;
    }
}