const Eris = require('eris');

class ExtendedUser extends Eris.ExtendedUser {
    constructor(data, client) {
        super(data, client);
        this.data = data;
    }
}

module.exports = ExtendedUser;