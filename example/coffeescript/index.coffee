{ Shard } = require "../../"

bot = new Shard "", {
    ext: {
        extensionDir: "./commands/"
    },
    hibiki: {
        owners: [
            ""
        ],
        prefixes: [
            "!~"
        ]
    },
    postgres: {
        database: "hibiki",
        user: "user"
    },
    ws: {
        host: "localhost"
    }
}

bot.connect()

bot.on "ready", () ->
    bot.init()
    console.log "Ready!"
