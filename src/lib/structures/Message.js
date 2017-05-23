const Eris = require('eris');
const Channel = require('./Channel.js');
const GuildChannel = require('./GuildChannel.js');
const User = require('./User.js');
const Member = require('./Member.js');

class Message extends Eris.Message {
    constructor (data, client) {
        super(data, client);
        console.log('heck offff')
        //console.log(client.guilds.get(client.channelGuildMap[data.channel_id]).channels.map(u => u.id))
        this.data = data;
        this.guild = this.channel.guild;
    }
}

module.exports = Message;