class Queue extends Command {
    constructor(client) {
        super(client)
        this.aliases = [
            "q"
        ]
    }

    run(ctx) {
        return new Promise((resolve, reject) => {

        });
    }
}

module.exports = Queue;