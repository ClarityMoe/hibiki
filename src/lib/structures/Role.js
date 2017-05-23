const Eris = require('eris');

class Role extends Eris.Role {
    constructor(data, guild) {
        super(data, guild);
        this.data = data;
    }
}

module.exports = Role;