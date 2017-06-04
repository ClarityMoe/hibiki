class Script {
    constructor(client) {
        this.client = client;
        this.bot = client;
        this.hibiki = client;
        this.cm = client.cm;
        this.lm = client.lm;
        this.logger = client.logger;
        this.db = client.db;
        this.type = 'extension';
        this.init();
    }

    events() {
        this.client.on('error', e => this.error(e));
        this.client.on('warn', w => this.warn(w));
        this.client.on('debug', d => this.debug(d));
        this.client.on('disconnect', () => this.disconnect());
        this.client.on('unknown', (p, i) => this.unknown(p, i));
        this.client.on('messageCreate', m => this.messageCreate(m));
        this.client.on('messageDelete', m => this.messageDelete(m));
        this.client.on('messageUpdate', (m, o) => this.messageUpdate(m, o));
        this.client.on('messageReactionAdd', (m, e, u) => this.messageReactionAdd(m, e, u));
        this.client.on('messageReactionRemove', (m, e, u) => this.messageReactionRemove(m, e, u));
        this.client.on('messageReactionRemoveAll', m => this.messageReactionRemoveAll(m));
        this.client.on('presenceUpdate', (s, o) => this.presenceUpdate(s, o));
        this.client.on('unavailableGuildCreate', g => this.unavailableGuildCreate(g));
        this.client.on('guildCreate', g => this.guildCreate(g));
        this.client.on('guildDelete', g => this.guildDelete(g));
        this.client.on('guildUpdate', (g, o) => this.guildMemberUpdate(g, o));
        this.client.on('guildUnavailable', g => this.guildUnavailable(g));
        this.client.on('guildBanAdd', (g, u, r) => this.guildBanAdd(g, u, r));
        this.client.on('guildBanRemove', (g, u, r) => this.guildBanRemove(g, u, r));
        this.client.on('guildMemberAdd', (g, m) => this.guildMemberAdd(g, m));
        this.client.on('guildMemberRemove', (g, m, r) => this.guildMemberRemove(g, m, r));
        this.client.on('guildMemberUpdate', (g, m, r) => this.guildMemberUpdate(g, m, r));
        this.client.on('userUpdate', (u, o) => this.userUpdate(u, o));
        this.client.on('voiceChannelJoin', (m, c) => this.voiceChannelJoin(m, c));
        this.client.on('voiceChannelLeave', (m, c) => this.voiceChannelLeave(m, c));
        this.client.on('voiceChannelSwitch', (m, n, o) => this.voiceChannelSwitch(m, n, o));
        this.client.on('voiceStateUpdate', (m, o) => this.voiceStateUpdate(m, o));
        // TODO: Add more events
        /*this.client.on('', () => this.());
        this.client.on('', () => this.());
        this.client.on('', () => this.());
        this.client.on('', () => this.());
        this.client.on('', () => this.());
        this.client.on('', () => this.());
        this.client.on('', () => this.());*/
        this.client.on('commandLoaded', (n, c) => this.commandLoaded(n, c));
    }

    init () {

    }

    /* eslint-disable no-unused-vars */

    middleware() {
        
    }

    messageCreate(m) {

    }

    messageDelete(m) {

    }

    messageUpdate(m, o) {

    }

    messageReactionAdd(m, e, u) {

    }

    messageReactionRemove(m, e, u) {
        
    }

    messageReactionRemoveAll(m) {

    }

    presenceUpdate(s, o) {

    }

    unavailableGuildCreate(g) {

    }

    guildCreate(g) {

    }

    guildDelete(g) {

    }

    guildUpdate(g, o) {

    }

    guildUnavailable(g) {

    }

    guildBanAdd(g, u, r) {

    }

    guildBanRemove(g, u, r) {

    }

    guildMemberAdd(g, m) {

    }

    guildMemberRemove(g, m, r) {

    }

    guildMemberUpdate(g, m, r) {

    }

    error(e) {

    }

    warn(w) {

    }

    debug(d) {

    }

    disconnect() {

    }

    unknown(p, i) {

    }

    voiceChannelJoin(m, c) {

    }

    voiceChannelLeave(m, c) {

    }

    voiceChannelSwitch(m, n, o) {

    }

    voiceStateUpdate(m, o) {

    }

    commandLoaded(n, c) {

    }

    /* eslint-enable no-unused-vars */

}

module.exports = Script;