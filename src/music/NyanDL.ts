// NyanDL.ts - YTDL Wrapper (noud02)

import { ChildProcess, spawn } from "child_process";
import { Writable } from "stream";

export function getStream (url: string): Writable {
    const stream: Writable = new Writable();

    const ytdl: ChildProcess = spawn("youtube-dl", [url, "-q", "-o", "-"]);
    const flac: ChildProcess = spawn("flac", ["-0", "-", "-"]);

    ytdl.stdout.pipe(flac.stdin);
    flac.stdout.pipe(stream);

    return stream;
}