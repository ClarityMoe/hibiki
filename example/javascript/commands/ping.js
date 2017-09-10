const Hibiki = require("../../../");

class Ping extends Hibiki.Command {
    constructor() {
        super();

        this.name = "ping";
        this.desc = "pong!";
    }

    run (ctx) {
        return ctx.send("Pong!");
    }
}

module.exports = Ping;
