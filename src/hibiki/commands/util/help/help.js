const { Command } = require('../../../../../');

class Help extends Command {
    constructor(client) {
        super(client);
    }

    run(ctx) {
        return new Promise((resolve, reject) => {
            // put your commands all under here
        });
    }
}

module.exports = Help;