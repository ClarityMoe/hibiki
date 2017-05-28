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

    info() {
        return console.info(this.time, this.s.info, Array.from(arguments).join(' '));
    }

    warn() {
        return console.warn(this.time, this.s.warn, Array.from(arguments).join(' '));
    }

    error() {
        return console.error(this.time, this.s.error, Array.from(arguments).join(' '));
    }

    log() {
        return console.log(this.time, Array.from(arguments).join(' '));
    }

    message(msg) {
        return console.log(this.time, clk.green(msg.channel.guild.name), clk.blue(msg.author.username), clk.cyan(msg.cleanContent), Array.from(arguments).slice(1).join(' '));
    }

    custom(opt) {
        if (!opt) throw new Error("No options specified");
        if (!opt.bgColor) opt.bgColor = 'black';
        if (!opt.color) opt.color = 'white';
        if (!clk[opt.color.toLocaleLowerCase()]) throw new Error("Invalid color");
        const bg = clk[`bg${opt.bgColor.toLocaleLowerCase().charAt(0).toLocaleUpperCase()}${opt.bgColor.toLocaleLowerCase().slice(1)}`];
        if (!bg) throw new Error("Invalid background color");
        const str = `${this.time} ${bg[opt.color.toLocaleLowerCase()](` ${opt.name} `)} ${Array.from(arguments).slice(1).join(' ')}`;
        return opt.error && console.error(str) || console.log(str);
    }

}

module.exports = Logger;