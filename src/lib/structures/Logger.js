const Chalk = require('chalk').constructor;
const clk = new Chalk({ enabled: true });
const moment = require('moment');

class Logger {
    constructor(opt) {
        this.opt = opt;
        this.s = {
            warn: clk.bgYellow(' WARN '),
            error: clk.bgRed(' ERROR '),
            info: clk.bgMagenta(' INFO ')
        }
    }

    get time() {
        return clk.cyan.bold(`[${moment().format('l')} @ ${moment().format('HH:mm:ss')}]`);
    }

    info(...args) {
        return console.info(this.time, this.s.info, args.join(' '));
    }

    warn(...args) {
        return console.warn(this.time, this.s.warn, args.join(' '));
    }

    error(...args) {
        return console.error(this.time, this.s.error, args.join(' '));
    }

    log(...args) {
        return console.log(this.time, args.join(' '));
    }

    message(msg, ...args) {
        return console.log(this.time, clk.green(msg.channel.guild.name), clk.blue(msg.author.username), clk.cyan(msg.cleanContent), args.join(' '));
    }

}

module.exports = Logger;