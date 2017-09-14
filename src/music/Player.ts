// Player.ts - Music Player instance (noud02)

import * as Eris from "eris";
import { EventEmitter } from "events";
import { Shard } from "../client/Shard";
import { Queue } from "./Queue";
import { Track } from "./Track";

export class Player extends EventEmitter {

    public queue: Queue = new Queue();
    public id: string = this.guild.id;
    public connection: Eris.VoiceConnection | undefined = this.shard.voiceConnections.get(this.id);
    public downloading: boolean = false;

    constructor (private shard: Shard, public guild: Eris.Guild, public channel: Eris.GuildChannel, public voice: Eris.GuildChannel) {
        super();

        this.queue.on("next", (track: Track) => this.play(track));

        if (channel.type !== 0) {
            throw new Error("Channel is not a text channel");
        }

        if (voice.type !== 2) {
            throw new Error("Voicechannel is not a voice channel");
        }
    }

    public get current (): Track | undefined {
        return this.queue.current;
    }

    public join (channel: Eris.GuildChannel): Promise<Eris.VoiceConnection> {
        if (channel.type !== 2) {
            return Promise.reject(new Error("Voicechannel is not a voice channel"));
        }

        if (this.connection && this.connection.channelID !== channel.id) {
            this.connection.switchChannel(channel.id);

            return Promise.resolve(this.connection);
        }

        if (this.connection && this.connection.channelID === channel.id) {
            return Promise.resolve(this.connection);
        }

        return this.shard.joinVoiceChannel(channel.id);
    }

    public async play (track: Track): Promise<Track | undefined> {
        if (!this.connection) {
            return Promise.reject(new Error("Not connected!"));
        }

        if (this.connection.connecting) {
            return Promise.reject(new Error("Still connecting!"));
        }

        if (this.connection.paused) {
            return Promise.reject(new Error("Music is paused!"));
        }

        if (this.connection.playing) {
            return Promise.reject(new Error("Already playing music!"));
        }

        if (this.downloading) {
            return Promise.reject(new Error("Still downloading music!"));
        }

        this.connection.play(track.download(), {
            encoderArgs: [
                "-filter_complex", "acrossfade=d=10", // fade
                "-af", "bass=g=10", // bass boost
            ],
            inlineVolume: true,
        });

        return Promise.resolve(this.queue.next());
    }

}
