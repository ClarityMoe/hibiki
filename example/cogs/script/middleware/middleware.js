class Test extends Script {
    constructor(client) {
        super(client)
        this.type = 'middleware';
    }

    middleware(msg, { prefix, command }) {
        return new Promise((resolve, reject) => {
            return this.logger.log('Hi', msg.author.username);
        });
    }
}

module.exports = Test;