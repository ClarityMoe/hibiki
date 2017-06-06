const EventEmitter = require('eventemitter3');

/**
 * 
 * 
 * @class DatabaseConnection
 * @extends {EventEmitter}
 */
class DatabaseConnection extends EventEmitter {
    /**
     * Creates an instance of DatabaseConnection.
     * @param {object?} client 
     * @param {object} options 
     * 
     * @memberof DatabaseConnection
     */
    constructor(client, options = {}) {
        super();
        this.client = client;
        this.opt = options;
        this.r = require('rethinkdbdash')(options.rethinkdb);
        
        this.r.tableList().run().then(list => {
            if (!list.includes('Users')) this.r.tableCreate('Users').run().error(console.error);
            if (!list.includes('Guilds')) this.r.tableCreate('Guilds').run().error(console.error);
            if (!list.includes('Messages')) this.r.tableCreate('Messages').run().error(console.error);
        });
    }

    getUser(id = "") {
        return this.r.table('Users').get(id).run().error(this.client.logger.error).then(user => user || this.addUser(this.client.users.get(id)));
    }

    getGuild(id = "") {
        return this.r.table('Guilds').get(id).run().error(this.client.logger.error).then(guild => guild || this.addGuild(this.client.guilds.get(id)));
    }

    addUser(user) {
        this.r.table('Users').insert({
            id: user.id,
            lang: 'en',
            commandsExecuted: 0,
            dev: false
        }).run().error(this.client.logger.error);
        return this.r.table('Users').get(user.id).run().error(this.client.logger.error);
    }

    addGuild(guild) {
        this.r.table('Guilds').insert({
            id: guild.id,
            lang: 'en',
            starboard: null,
            modlog: null,
            stars: [],
            logs: [],
            messagelogs: false,
            modlogs: false,
            queue: []
        }).run().error(this.client.logger.error);
        return this.r.table('Guilds').get(guild.id).run().error(this.client.logger.error);
    }

    editUser(id, opt) {
        this.r.table('Users').update(opt).run().error(this.client.logger.error);
        return this.r.table('Users').get(id).run().error(this.client.logger.error);
    }

    editGuild(id, opt) {
        this.r.table('Guilds').update(opt).run().error(this.client.logger.error);
        return this.r.table('Guilds').get(id).run().error(this.client.logger.error);
    }

    /*logMessage(msg, event, opt) {
        return this.r.table('Messages').insert({
            id: event !== 'CREATE' ? `${msg.id}_${event}` : msg.id,
            author: {
                username: msg.author.username,
                discriminator: msg.author.discriminator,
                avatarURL: msg.author.avatarURL,
                id: msg.author.id
            },
            member: {
                id: msg.member.id,
                roles: msg.member.roles,
                nick: msg.member.nick
            },
            guild: {
                id: msg.channel.guild.id,
                iconURL: msg.channel.guild.iconURL,
                name: msg.channel.guild.name
            },
            channel: {
                id: msg.channel.id,
                name: msg.channel.name,
            },
            mentions: msg.mentions.map(m => m.id),
            channelMentions: msg.channelMentions,
            content: msg.content,
            htmlContent: msg.htmlContent,
            embeds: msg.embeds,
            htmlEmbeds: msg.htmlEmbeds,
            attachments: msg.attachments,
            htmlAttachments: msg.htmlAttachments,
            reactions: msg.reactions,
            htmlReactions: msg.htmlReactions
        }).run().error(this.client.logger.error);
    }*/

}

module.exports = DatabaseConnection;