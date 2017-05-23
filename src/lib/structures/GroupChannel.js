const Eris = require('eris');

class GroupChannel extends Eris.GroupChannel {
    constructor(data, client) {
        super(data, client);
        this.data = data;
    }
}

module.exports = GroupChannel;