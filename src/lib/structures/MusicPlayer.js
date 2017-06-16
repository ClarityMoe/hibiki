const EventEmitter = require('eventemitter3');
const numeral = require('numeral');
const got = require('got');

class MusicPlayer extends EventEmitter {
    constructor(client, guild) {
        super();
        this.id = guild.id;
        this._client = client;

        if (client.voiceConnections.has(this.id) && client.voiceConnections.get(this.id).ready) this.emit('ready');

        this.repeat = false;
        this.autoplay = false;
        this.current = null;
        this.last = null;
        this.voteskip = [];

    }

    getNext() {
        return new Promise((resolve, reject) => {
            this._client.db.getGuild(this.id).then(guild => {
                if (guild.queue.length > 1 && guild.queue[1]) resolve(guild.queue.length > 1 && guild.queue[1])
                else if (this.current && this.autoplay) {
                    got(this.current.url).then(res => {
                        try {
                            resolve(res.body.match('<a.+content-link spf-link  yt-uix-sessionlink      spf-link[^>]+')[0].match('title="([^"]+)"')[1]);
                        } catch (e) {
                            resolve(null);
                        }
                    });
                } else resolve(null);
            })
        })
    }

    get connection() {
        return this._client.voiceConnections.get(this.id);
    }

    get playing() {
        return this.connection && this.connection.playing || false;
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
                resolve(conn);
            });
        })
    }

    play() {
        return new Promise((resolve, reject) => {
            this.voteskip = [];
            if (!this.connection) return reject("not_connected");
            if (!this.connection.ready) return reject("not_ready");
            if (this.connection.playing) return reject("already_playing");
            this._client.db.getGuild(this.id).then(g => {
                const queue = g.queue;

                if (!this.repeat && queue.length === 0) return reject("queue_empty");

                const song = this.repeat && this.current || queue.shift();

                this.current = song;

                this.emit('next', this.current);

                resolve(this.current);

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
                });

                this.connection.once('error', (e) => {
                    this.emit('error', e);
                    this.disconnect();
                    this.connection.removeAllListeners();
                })

                this.on('stop', () => {
                    this.connection.removeAllListeners();
                    this.connection.stopPlaying();
                });
            });
        });
    }

    next() {
        return new Promise((resolve, reject) => {
            this._client.db.getGuild(this.id).then(guild => {
                new Promise((resolv, rejec) => {
                    if (guild.queue.length === 0 && this.autoplay) {
                        got(this.current.url).then(res => {
                            let id;
                            try {
                                id = res.body.match('<a.+content-link spf-link  yt-uix-sessionlink      spf-link[^>]+')[0].match('href="/watch\\?v=([^"]+)"')[1];
                            } catch (e) {
                                resolv();
                            }
                            if (!id) return resolv();
                            this._client.ytdl.getInfo(`https://youtube.com/watch?v=${id}`).then(info => this.enqueue(info, this._client.user.id)).catch(rejec).then(resolv);
                        });
                    } else resolv();
                }).then(() => {
                    this.play().then(resolve).catch(e => {
                        switch (e) {
                            case 'already_playing': {
                                this.emit("alreadyPlaying");
                                break;
                            }
                            case 'queue_empty': {
                                this.emit('queueEmpty');
                                break;
                            }
                            case 'not_ready': {
                                this.emit('notReady');
                                break;
                            }
                            case 'not_connected': {
                                this.emit('notConnected');
                                break;
                            }
                            default: {
                                reject(e);
                                break;
                            }
                        }
                    });
                }).catch(reject);
            });
        });
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

    stop() {

    }
}

module.exports = MusicPlayer;