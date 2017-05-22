global.Promise = require('bluebird');

const Eris = require('eris');
const Message = require('./structures/Message.js');
const CommandManager = require('./managers/CommandManager.js');
const DatabaseConnection = require('./structures/DatabaseConnection.js');
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
        this.db = new DatabaseConnection(this, this.opt.db);
        this.logger = new Logger(this.opt.logger);
        this.cm = new CommandManager(this, opt);

        this.on('ready', () => {
            this.cm.loadAll();
        })

        this.on('rawWS', p => {
            const d = p.d;
            const op = p.op;
            const t = p.t;
            switch(op) {
                case 0:
                    switch(t) {
                        case 'MESSAGE_CREATE':
                            this.emit('message', new Message(d));
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
        });

        

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