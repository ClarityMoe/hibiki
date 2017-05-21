const Chalk = require('chalk').constructor;
const clk = new Chalk({ enabled: true });
const moment = require('moment');

class Logger {
    constructor(opt) {
        this.opt = opt;
        this.s = {
            warn: clk.bgYellow(' WARN '),
            error: clk.bgRed(' ERROR ')
        }
    }

    get time() {
        return `[${moment().format('l')} @ ${moment().format('HH:mm:ss')}]`;
    }

    warn(...args) {
        return console.warn(this.time, this.s.warn, args);
    }

    error(...args) {
        return console.error(this.time, this.s.error, args);
    }

    log(...args) {
        return console.log(this.time, args);
    }

    message(msg, ...args) {
        return console.log(this.time, clk.green(msg.channel.guild.name), clk.blue(msg.author.username), clk.cyan(msg.cleanContent), args);
    }

}

module.exports = Logger;