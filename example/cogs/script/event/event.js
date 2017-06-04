class TestEvent extends Script {
    constructor(client) {
        super(client);
    }

    init() {
        this.events();
    }

    guildMemberAdd(guild, member) {
        const welcome = this.client.Constants.SystemJoinMessages[Math.floor(Math.random() * this.client.Constants.SystemJoinMessages.length)]
        guild.defaultChannel.createMessage(welcome.replace(/%user%/g, `**${member.username}**`));
    }
}

module.exports = TestEvent;