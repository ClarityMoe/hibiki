const EventEmitter = require('eventemitter3');
const numeral = require('numeral');
const request = require('request');
const PassThrough = require('stream').PassThrough;

class MusicPlayer extends EventEmitter {
    constructor(client, guild) {
        super();
        this.id = guild.id;
        this._client = client;

        if (client.voiceConnections.has(this.id) && client.voiceConnections.get(this.id).ready) this.emit('ready');

        this.repeat = false;
        this.current = null;
        this.voteskip = [];

    }

    get connection() {
        return this._client.voiceConnections.get(this.id);
    }

    get playing() {
        return this.connection.playing;
    }

    get timeLeft() {
        return this.connection && (this.current.duration - this.connection.current.playTime / 1000) || 0;
    }

    get ready() {
        return this.connection.ready;
    }

    /**
     * Get the queue of the music player
     * 
     * @returns {Promise<Object[]>}
     * 
     * @memberof MusicPlayer
     */

    queue() {
        return new Promise((resolve, reject) => this._client.db.getGuild(this.id).then(g => resolve(g.queue)).catch(reject));
    }

    /**
     * Have the player join a channel.
     * 
     * @param {String} id 
     * 
     * @memberof MusicPlayer
     */

    join(id) {
        return new Promise((resolve, reject) => {
            if (!this._client.getChannel(id)) return reject(new Error("Voicechannel not found"));
            if (this._client.getChannel(id).type !== 2) return reject(new Error("Channel is not a voice channel"));
            this._client.joinVoiceChannel(id).catch(reject).then(conn => {
                conn.once('ready', () => {
                    this.emit('ready');
                });
            });
        })
    }

    play() {
        return new Promise((resolve, reject) => {
            this.voteskip = [];
            if (!this.connection) return reject(new Error("Not connected!"));
            if (!this.connection.ready) return reject(new Error("Not ready!"));
            if (this.connection.playing) return reject(new Error("Already playing!"));
            this._client.db.getGuild(this.id).then(g => {
                const queue = g.queue;

                if (queue.length === 0) return reject(new Error("Queue is empty!"));

                const song = queue.shift();

                this.current = {
                    title: song.title,
                    url: song.url,
                    duration: song.duration,
                    user: song.user,
                    thumbnail: song.thumbnail
                }

                this.emit('next', this.current);

                this.connection.play(song.dl, {
                    inlineVolume: true,
                    inputArgs: [
                        "-reconnect", "1", 
                        "-reconnect_streamed", "1", 
                        "-reconnect_delay_max", "2"
                    ]
                });
                
                this.connection.once('end', () => {
                    this._client.db.editGuild(this.id, {
                        queue: queue
                    })
                    this.connection.removeAllListeners();
                    setTimeout(() => this.next(), 100);
                })

            })
        })
    }

    /**
     * Pauses the connection 
     * 
     * @memberof MusicPlayer
     */

    pause() {
        if (!this.connection) return this.emit('error', new Error("Not connected!"));
        if (!this.connection.ready) return this.emit('error', new Error("Not ready yet!"));
        try {
            this.connection.pause();
            this.emit('pause');
        } catch (e) {
            this.emit('error', e);
        }
    }

    /**
     * Resumes the connection
     * @memberof MusicPlayer
     */

    resume() {
        if (!this.connection) return this.emit('error', new Error("Not connected!"));
        if (!this.connection.ready) return this.emit('error', new Error("Not ready yet!"));
        if (!this.connection.paused) return this.emit('error', new Error("Not paused!"));
        try {
            this.connection.resume();
            this.emit('resume')
        } catch (e) {
            this.emit('error', e);
        }
    }

    /**
     * Enqueue songs
     * 
     * @param {Object|String} info 
     * @param {String} user ID of the user that added the song(s)
     * @returns {Promise<Object?>}
     * 
     * @memberof MusicPlayer
     */

    enqueue(info, user) {
        return new Promise((resolve, reject) => {
            new Promise((resolv, rejec) => {
                if (typeof info === 'string') return this._client.ytdl.getData(info).then(resolv).catch(rejec);
                resolv(info);
            }).then(inf => {
                this._client.db.getGuild(this.id).then(g => {
                    if (Array.isArray(inf)) {
                        const items = [];

                        for (const item of inf) {
                            items.push({
                                title: item.title,
                                url: item.webpage_url,
                                dl: item.url,
                                user: user,
                                duration: numeral(item.duration).format(),
                                date: Date.now(),
                                thumbnail: item.thumbnails[0].url
                            });
                        }

                        this._client.db.editGuild(this.id, {
                            queue: g.queue.concat(items)
                        }).catch(reject).then(res => {
                            resolve(res);
                            this.emit('queueUpdated', res.queue, 'add')
                        });

                    } else {
                        g.queue.push({
                            title: inf.title,
                            url: inf.webpage_url,
                            dl: inf.url,
                            user: user,
                            duration: numeral(inf.duration).format(),
                            date: Date.now(),
                            thumbnail: inf.thumbnails[0].url
                        })
                        this._client.db.editGuild(this.id, {
                            queue: g.queue
                        }).catch(reject).then(res => {
                            resolve(res);
                            this.emit('queueUpdated', res.queue, 'add');
                        });
                    }
                }).catch(reject);
            }).catch(reject);
        })
    }

    next() {

    }

    stop() {

    }
}

module.exports = MusicPlayer;