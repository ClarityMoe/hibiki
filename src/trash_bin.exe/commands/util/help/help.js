const { Command } = require('../../../../../');

class Help extends Command {
    constructor(client) {
        super(client);
    }
/** @todo remove disable once there's an actual help command here */
/* eslint-disable no-unused-vars */
    run(ctx) {
        return new Promise((resolve, reject) => {          
            // put your commands all under here
        });
    }
}

module.exports = Help;