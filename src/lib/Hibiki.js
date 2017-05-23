global.Promise = require('bluebird');

const Eris = require('eris');
//const Message = require('./structures/Message.js');
const ShardManager = require('./gateway/ShardManager.js');
const CommandManager = require('./managers/CommandManager.js');
const DatabaseConnection = require('./structures/DatabaseConnection.js');
const Guild = require('./structures/Guild.js');
const GroupChannel = require('./structures/GroupChannel.js');
const GuildChannel = require('./structures/GuildChannel.js');
const PrivateChannel = require('./structures/PrivateChannel.js');
const User = require('./structures/User.js');
const Logger = require('./structures/Logger.js');

/**
 * 
 * 
 * @class Hibiki
 * @extends {Eris.Client}
 */
class Hibiki extends Eris.Client {
    /**
     * Creates an instance of Hibiki.
     * @param {string} token Your bot token.
     * @param {object} hibikiOptions Options for the framework.
     * @param {object} [options] Eris options.
     * 
     * @memberof Hibiki
     */
    constructor(token = "nicememe", opt = {}, options = {}) {
        if (!opt) throw new Error("No options for the framework specified");
        super(token, options);
        this.opt = opt;
        this.shards = new ShardManager(this);
        this.guilds = new Eris.Collection(Guild);
        this.users = new Eris.Collection(User);
        this.groupChannels = new Eris.Collection(GroupChannel);
        this.guildChannels = new Eris.Collection(GuildChannel);
        this.privateChannels = new Eris.Collection(PrivateChannel);
        this.db = new DatabaseConnection(this, this.opt.db);
        this.logger = new Logger(this.opt.logger);
        this.cm = new CommandManager(this, opt);

        this.on('ready', () => {
            this.cm.loadAll();
            console.log(this.guilds.size)
            this.emit('hibikiReady');
            console.log(this.channelGuildMap)
        })

        /*this.on('rawWS', p => {
            const d = p.d;
            const op = p.op;
            const t = p.t;
            switch (op) {
                case 0:
                    if (Array.isArray(options.disableEvents) && options.disableEvents.includes(t) || typeof options.disableEvents === 'string' && t === options.disableEvents || typeof options.disableEvents === 'object' && Object.keys(options.disableEvents).includes(t)) return;
                    console.log(t);
                    switch (t) {
                        case 'MESSAGE_CREATE':
                            //console.log(new Message(d, this));
                            const channel = this.getChannel(d.channel_id);
                            if (channel) {
                                channel.lastMessageID = d.id;
                                /**
                                 * Fired when a message is created
                                 * @event Hibiki#message
                                 * @prop {Message} message The message
                                 */
                                /*
                                this.emit('message', channel.messages.add(d, this));
                            } else this.emit('debug', "MESSAGE_CREATE but channel not found (OK if deleted channel)");
                            
                            break;
                        default:
                            this.emit('unknown', p);
                            break;
                    }
                    break;
                default:
                    this.emit('unknown', p);
                    break;
            }
        });*/



        this.on('guildMemberRemove', async (guild, member) => {
            const g = await this.db.getGuild(guild.id);
            if (!g.modlogs || !guild.members.get(this.user.id).permission.has('viewAuditLogs')) return;
            const logs = await guild.getAuditLogs(10, null, 20).catch(this.logger.error);
            this.emit('guildMemberKick', guild, member, logs.entries.filter(log => log.targetID === member.id)[0]);

        })

    }

    /**
     * Get the active voice connections
     * 
     * @readonly
     * 
     * @memberof Hibiki
     */
    get activeVoiceConnections() {
        return this.voiceConnections.filter(c => c.playing);
    }
}

module.exports = Hibiki;