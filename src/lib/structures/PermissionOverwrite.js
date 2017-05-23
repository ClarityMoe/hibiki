const Eris = require('eris');

class PermissionOverwrite extends Eris.PermissionOverwrite {
    constructor(data) {
        super(data);
        this.data = data;
    }
}

module.exports = PermissionOverwrite;