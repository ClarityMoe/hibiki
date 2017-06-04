const ytdl = require('youtube-dl');
const EventEmitter = require('eventemitter3');
const numeral = require('numeral');
const PassThrough = require('stream').PassThrough;
const request = require('request');
const twitch = require("twitch-get-stream")("jzkbprff40iqj646a697cyrvl0zt2m6");

class YoutubeDL extends EventEmitter {
    constructor(opt) {
        super();
        this.opt = opt || {};
        this._ytbase = `^(https?:\/\/)?(m\.|www\.)?youtube\..+\/`;
        this._ytbase2 = `^(https?:\/\/)?(m\.|www\.)?youtu\.be\/`;
        this._scbase = `^(https?:\/\/)?(m\.)?soundcloud\.com\/`;

        this._ytv = str => new RegExp(this._ytbase + `watch\?v=[^&]+`).test(str) || new RegExp(this._ytbase2 + `.+`).test(str);
        this._tws = str => /^(https?:\/\/)?(m\.|www\.)?twitch\.tv\/[^/|?]+/.test(str);
        this._ytp = str => new RegExp(this._ytbase + `playlist?list=[^&]+`).test(str);
    } 

    _getDownload(url, info) {
        return new Promise((resolve, reject) => {
            let url;
            const form = info.formats;
            const extr = info.extractor;

            switch(extr) {
                case 'twitch:stream': {
                    return twitch.get(url.match(/\.tv\/([^/|?]+)/)[1]).then(s => resolve(s.filter(st => st.quality === "Audio Only")[0].url)).catch(reject);
                }
                case 'Bandcamp': {
                    url = form.filter(f => f.format === 'mp3-128 - audio only')[0].url;
                    break;
                }
                case 'soundcloud': {
                    url = form.filter(f => f.format === 'http_mp3_128_url - audio only')[0].url;
                    break;
                }
                default: {
                    url = info.url;
                    break;
                }
            }

            if (!url) return reject(new Error("Could not find download URL"));

            resolve(url);

        });
    }

    getInfo(url) {
        return new Promise((resolve, reject) => {
            ytdl.getInfo(url, (err, info) => {
                if (err) return reject(err);
                resolve(info);
            });
        });
    }

    getStream(url) {
        return new Promise((resolve, reject) => {
            if (this._tws(url)) return twitch.get(url.match(/\.tv\/([^/|?]+)/)[1]).then(s => resolve(s.filter(st => st.quality === "Audio Only")[0].url)).catch(reject);
            else return this.getData(url).then(data => resolve(request(data.download).pipe(new PassThrough()))).catch(reject);
        })
    }

    getData(url) {
        return new Promise((resolve, reject) => {
            this.getInfo(url).then(info => {

                if (Array.isArray(info)) return reject(new Error('URL is a playlist'));

                if (info.extractor === 'youtube' && info.is_live) return reject(new Error('YouTube URL is a live stream'));

                const data = {
                    duration: numeral(info.duration).format(),
                    id: info.id,
                    title: info.title,
                    thumbnail: info.thumbnail,
                    extractor: info.extractor,
                    extension: info.ext,
                    url: info.webpage_url
                }

                this._getDownload(url, info).then(url => {
                    data.download = url;
                    resolve(data);
                }).catch(reject);
            }).catch(reject);
        })
    }
}

module.exports = YoutubeDL;