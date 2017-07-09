class Queue extends Command {
    constructor(client) {
        super(client)
        this.aliases = [
            "q"
        ]
    }

    run(ctx) {
        return new Promise((resolve, reject) => {
            if (ctx.db.guild.queue.length > 0) resolve({
                embed: {
                    title: 'Queue',
                    description: ctx.db.guild.queue.map((s, i) => `${i}. ${s}`);
                }
            });
            else resolve('The queue is empty!')
        });
    }
}

module.exports = Queue;