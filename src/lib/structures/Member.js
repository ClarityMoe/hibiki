const Eris = require('eris');

class Member extends Eris.Member {
    constructor(data, guild) {
        super(data, guild);
        this.data = data;
    }
}

module.exports = Member;