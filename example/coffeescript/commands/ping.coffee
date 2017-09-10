Hibiki = require "../../../"

class Ping extends Hibiki.Command
    constructor: () ->
        super()

        @name = "ping"
        @desc = "pong!"

    run: (ctx) ->
        ctx.send("Pong!")

module.exports = Ping
