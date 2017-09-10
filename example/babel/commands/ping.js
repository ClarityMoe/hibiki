const Hibiki = require("../../../");

@Hibiki.ext.command("ping")
@Hibiki.ext.description("pong!")
class Ping extends Hibiki.Command {
    run (ctx) {
        return ctx.send("Pong!");
    }
}

module.exports = Ping;
