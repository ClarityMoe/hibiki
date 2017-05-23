const Eris = require('eris');
const Message = require('./Message.js');
const Member = require('./Member.js');

class GuildChannel extends Eris.GuildChannel {
    constructor(data, guild, messageLimit) {
        super(data, guild, messageLimit);
        if (this.type === 2) this.voiceMembers = new Eris.Collection(Member);
        else {
            if (messageLimit == null && guild) messageLimit = guild.shard.client.options.messageLimit;
            this.messages = new Eris.Collection(Message, messageLimit);
        }
    }
}

module.exports = GuildChannel;