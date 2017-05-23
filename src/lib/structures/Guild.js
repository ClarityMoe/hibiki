const Eris = require('eris');
const GuildChannel = require('./GuildChannel.js');
const Member = require('./Member.js');
const Role = require('./Role.js');

class Guild extends Eris.Guild {
    constructor(data, client) {
        super(data, client);
        this.data = data;
        this._client = client;
        console.log("heck off");
        this.channels = new Eris.Collection(GuildChannel);
        this.members = new Eris.Collection(Member);
        this.roles = new Eris.Collection(Role);
        console.log(this.channels);
    }

    get bot() {
        return this.members.get(this._client.user.id);
    }

    get botPermission() {
        return this.members.get(this._client.user.id).permission;
    }

}

module.exports = Guild;