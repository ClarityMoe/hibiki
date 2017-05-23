const Eris = require('eris');
const ExtendedUser = require('../structures/ExtendedUser.js');
const User = require('../structures/User.js');
const Call = require('../structures/Call.js');
const WebSocket = typeof window !== "undefined" ? window.WebSocket : require('uws');

class Shard extends Eris.Shard {
    constructor(id, client) {
        super(id, client);
    }

    get latency() {
        return this.lastHeartbeatSent && this.lastHeartbeatReceived ? this.lastHeartbeatReceived - this.lastHeartbeatSent : null; // tfw infinite latency
    }

    /**
     * Tells the shard to connect
     */
    connect() {
        if(this.ws && this.ws.readyState != WebSocket.CLOSED) {
            this.client.emit("error", new Error("Existing connection detected"), this.id);
            return;
        }
        ++this.connectAttempts;
        this.connecting = true;
        /**
         * Fired when a shard starts connecting.
         * @event Hibiki#shardConnecting
         * @prop {Number} id ID of the shard that's connecting.
         */
        this.client.emit('shardConnecting', this.id);
        return this.initializeWS();
    }

    wsEvent(packet) {
        switch (packet.t) { /* eslint-disable no-redeclare */ // (╯°□°）╯︵ ┻━┻
            case "PRESENCE_UPDATE": {
                if (packet.d.user.username !== undefined) {
                    let user = this.client.users.get(packet.d.user.id);
                    let oldUser = null;
                    if (user && (user.username !== packet.d.user.username || user.avatar !== packet.d.user.avatar)) {
                        oldUser = {
                            username: user.username,
                            discriminator: user.discriminator,
                            avatar: user.avatar
                        };
                    }
                    if (!user || oldUser) {
                        user = this.client.users.update(packet.d.user, this.client);
                        /**
                        * Fired when a user's username or avatar changes
                        * @event Hibiki#userUpdate
                        * @prop {User} user The updated user
                        * @prop {Object?} oldUser The old user data
                        * @prop {String} oldUser.username The username of the user
                        * @prop {String} oldUser.discriminator The discriminator of the user
                        * @prop {String?} oldUser.avatar The hash of the user's avatar, or null if no avatar
                        */
                        this.client.emit("userUpdate", user, oldUser);
                    }
                }
                if (!packet.d.guild_id) {
                    packet.d.id = packet.d.user.id;
                    let relationship = this.client.relationships.get(packet.d.id);
                    if (!relationship) { // Removing relationships
                        break;
                    }
                    let oldPresence = {
                        game: relationship.game,
                        status: relationship.status
                    };
                    /**
                    * Fired when a guild member or relationship's status or game changes
                    * @event Hibiki#presenceUpdate
                    * @prop {Member | Relationship} other The updated member or relationship
                    * @prop {Object?} oldPresence The old presence data. If the user was offline when the bot started and the client option getAllUsers is not true, this will be null
                    * @prop {String} oldPresence.status The other user's old status. Either "online", "idle", or "offline"
                    * @prop {Object?} oldPresence.game The old game the other user was playing
                    * @prop {String} oldPresence.game.name The name of the active game
                    * @prop {Number} oldPresence.game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
                    * @prop {String} oldPresence.game.url The url of the active game
                    */
                    this.client.emit("presenceUpdate", this.client.relationships.update(packet.d), oldPresence);
                    break;
                }
                let guild = this.client.guilds.get(packet.d.guild_id);
                if (!guild) {
                    this.client.emit("warn", "Rogue presence update: " + JSON.stringify(packet), this.id);
                    break;
                }
                let member = guild.members.get(packet.d.id = packet.d.user.id);
                let oldPresence = null;
                if (member && (member.status !== packet.d.status || (member.game !== packet.d.game && (!member.game || !packet.d.game || member.game.name !== packet.d.game.name || member.game.type !== packet.d.game.type || member.game.url !== packet.d.game.url)))) {
                    oldPresence = {
                        game: member.game,
                        status: member.status
                    };
                }
                if ((!member && packet.d.user.username) || oldPresence) {
                    member = guild.members.update(packet.d, guild);
                    this.client.emit("presenceUpdate", member, oldPresence);
                }
                break;
            }
            case "VOICE_STATE_UPDATE": { // (╯°□°）╯︵ ┻━┻
                if (packet.d.guild_id === undefined) {
                    packet.d.id = packet.d.user_id;
                    if (packet.d.channel_id === null) {
                        let flag = false;
                        for (let groupChannel of this.client.groupChannels) {
                            let call = (groupChannel[1].call || groupChannel[1].lastCall);
                            if (call && call.voiceStates.remove(packet.d)) {
                                flag = true;
                                break;
                            }
                        }
                        if (!flag) {
                            for (let privateChannel of this.client.privateChannels) {
                                let call = (privateChannel[1].call || privateChannel[1].lastCall);
                                if (call && call.voiceStates.remove(packet.d)) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (!flag) {
                                this.client.emit("error", new Error("VOICE_STATE_UPDATE for user leaving call not found"));
                                break;
                            }
                        }
                    } else {
                        let channel = this.client.getChannel(packet.d.channel_id);
                        if (!channel.call && !channel.lastCall) {
                            this.client.emit("error", new Error("VOICE_STATE_UPDATE for untracked call"));
                            break;
                        }
                        (channel.call || channel.lastCall).voiceStates.update(packet.d);
                    }
                    break;
                }
                let guild = this.client.guilds.get(packet.d.guild_id);
                if (!guild) {
                    break;
                }
                if (guild.pendingVoiceStates) {
                    guild.pendingVoiceStates.push(packet.d);
                    break;
                }
                let member = guild.members.get(packet.d.id = packet.d.user_id);
                if (!member) {
                    let channel = guild.channels.find((channel) => channel.type === 2 && channel.voiceMembers.get(packet.d.id));
                    if (channel) {
                        channel.voiceMembers.remove(packet.d);
                        this.client.emit("debug", "VOICE_STATE_UPDATE member null but in channel: " + packet.d.id, this.id);
                        break;
                    }
                    break;
                }
                let oldState = {
                    mute: member.voiceState.mute,
                    deaf: member.voiceState.deaf,
                    selfMute: member.voiceState.selfMute,
                    selfDeaf: member.voiceState.selfDeaf
                };
                let oldChannelID = member.voiceState.channelID;
                member.update(packet.d, this.client);
                if (member.user.id === this.client.user.id) {
                    let voiceConnection = this.client.voiceConnections.get(packet.d.guild_id);
                    if (voiceConnection && voiceConnection.channelID !== packet.d.channel_id) {
                        voiceConnection.switchChannel(packet.d.channel_id, true);
                    }
                }
                if (oldChannelID != packet.d.channel_id) {
                    let oldChannel, newChannel;
                    if (oldChannelID) {
                        oldChannel = guild.channels.get(oldChannelID);
                    }
                    if (packet.d.channel_id && (newChannel = guild.channels.get(packet.d.channel_id)) && newChannel.type === 2) { // Welcome to Discord, where one can "join" text channels
                        if (oldChannel) {
                            /**
                            * Fired when a guild member switches voice channels
                            * @event Hibiki#voiceChannelSwitch
                            * @prop {Member} member The member
                            * @prop {GuildChannel} newChannel The new voice channel
                            * @prop {GuildChannel} oldChannel The old voice channel
                            */
                            oldChannel.voiceMembers.remove(member);
                            this.client.emit("voiceChannelSwitch", newChannel.voiceMembers.add(member, guild), newChannel, oldChannel);
                        } else {
                            /**
                            * Fired when a guild member joins a voice channel. This event is not fired when a member switches voice channels, see `voiceChannelSwitch`
                            * @event Hibiki#voiceChannelJoin
                            * @prop {Member} member The member
                            * @prop {GuildChannel} newChannel The voice channel
                            */
                            this.client.emit("voiceChannelJoin", newChannel.voiceMembers.add(member, guild), newChannel);
                        }
                    } else if (oldChannel) {
                        /**
                        * Fired when a guild member leaves a voice channel. This event is not fired when a member switches voice channels, see `voiceChannelSwitch`
                        * @event Hibiki#voiceChannelLeave
                        * @prop {Member} member The member
                        * @prop {GuildChannel} oldChannel The voice channel
                        */
                        this.client.emit("voiceChannelLeave", oldChannel.voiceMembers.remove(member), oldChannel);
                    }
                }
                if (oldState.mute !== member.mute || oldState.deaf !== member.deaf || oldState.selfMute !== member.selfMute || oldState.selfDeaf !== member.selfDeaf) {
                    /**
                    * Fired when a guild member's voice state changes
                    * @event Hibiki#voiceStateUpdate
                    * @prop {Member} member The member
                    * @prop {Object} oldState The old voice state
                    * @prop {Boolean} oldState.mute The previous server mute status
                    * @prop {Boolean} oldState.deaf The previous server deaf status
                    * @prop {Boolean} oldState.selfMute The previous self mute status
                    * @prop {Boolean} oldState.selfDeaf The previous self deaf status
                    */
                    this.client.emit("voiceStateUpdate", member, oldState);
                }
                break;
            }
            case "TYPING_START": {
                if (this.client.listeners("typingStart").length > 0) {
                    /**
                    * Fired when a user begins typing
                    * @event Hibiki#typingStart
                    * @prop {Channel} channel The text channel the user is typing in
                    * @prop {User} user The user
                    */
                    this.client.emit("typingStart", this.client.getChannel(packet.d.channel_id), this.client.users.get(packet.d.user_id));
                }
                break;
            }
            case "MESSAGE_CREATE": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (channel) { // MESSAGE_CREATE just when deleting o.o
                    channel.lastMessageID = packet.d.id;
                    /**
                    * Fired when a message is created
                    * @event Hibiki#messageCreate
                    * @prop {Message} message The message
                    */
                    this.client.emit("messageCreate", channel.messages.add(packet.d, this.client));
                } else {
                    this.client.emit("debug", "MESSAGE_CREATE but channel not found (OK if deleted channel)", this.id);
                }
                break;
            }
            case "MESSAGE_UPDATE": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (!channel) {
                    break;
                }
                let message = channel.messages.get(packet.d.id);
                let oldMessage = null;
                if (message) {
                    oldMessage = {
                        attachments: message.attachments,
                        content: message.content,
                        embeds: message.embeds,
                        editedTimestamp: message.editedTimestamp,
                        mentionedBy: message.mentionedBy,
                        mentions: message.mentions,
                        roleMentions: message.roleMentions,
                        channelMentions: message.channelMentions,
                        tts: message.tts
                    };
                }
                /**
                * Fired when a message is updated
                * @event Hibiki#messageUpdate
                * @prop {Message} message The updated message. If oldMessage is null, it is recommended to discard this event, since the message data will be very incomplete (only `id` and `channel` are guaranteed)
                * @prop {Object?} oldMessage The old message data. If the message was cached, this will return the full old message. Otherwise, it will be null
                * @prop {Object[]} oldMessage.attachments Array of attachments
                * @prop {Object[]} oldMessage.embeds Array of embeds
                * @prop {String} oldMessage.content Message content
                * @prop {Number} oldMessage.editedTimestamp Timestamp of latest message edit
                * @prop {Object} oldMessage.mentionedBy Object of if different things mention the bot user
                * @prop {Boolean} oldMessage.tts Whether to play the message using TTS or not
                * @prop {String[]} oldMessage.mentions Array of mentioned users' ids
                * @prop {String[]} oldMessage.roleMentions Array of mentioned roles' ids.
                * @prop {String[]} oldMessage.channelMentions Array of mentions channels' ids.
                */
                this.client.emit("messageUpdate", channel.messages.update(packet.d, this.client), oldMessage);
                break;
            }
            case "MESSAGE_DELETE": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (!channel) {
                    break;
                }
                /**
                * Fired when a cached message is deleted
                * @event Hibiki#messageDelete
                * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. No other property is guaranteed
                */
                this.client.emit("messageDelete", channel.messages.remove(packet.d) || {
                    id: packet.d.id,
                    channel: channel
                });
                break;
            }
            case "MESSAGE_DELETE_BULK": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (!channel) {
                    break;
                }

                /**
                 * Fired when a bulk delete occurs
                 * @event Hibiki#messageDeleteBulk
                * @prop {Message[] | Object[]} messages An array of (potentially partial) message objects. If a message is not cached, it will be an object with `id` and `channel` keys. No other property is guaranteed
                 */
                this.client.emit("messageDeleteBulk", packet.d.ids.map((id) => (channel.messages.remove({
                    id
                }) || {
                        id: id,
                        channel: channel
                    })));
                break;
            }
            case "MESSAGE_REACTION_ADD": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (!channel) {
                    break;
                }
                let message = channel.messages.get(packet.d.message_id);
                if (message) {
                    let reaction = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                    if (message.reactions[reaction]) {
                        ++message.reactions[reaction].count;
                        if (packet.d.user_id === this.client.user.id) {
                            message.reactions[reaction].me = true;
                        }
                    } else {
                        message.reactions[reaction] = {
                            count: 1,
                            me: packet.d.user_id === this.client.user.id
                        };
                    }
                }
                /**
                * Fired when someone adds a reaction to a message
                * @event Hibiki#messageReactionAdd
                * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. No other property is guaranteed
                * @prop {Object} emoji The reaction emoji object
                * @prop {String?} emoji.id The emoji ID (null for non-custom emojis)
                * @prop {String} emoji.name The emoji name
                * @prop {String} userID The ID of the user that added the reaction
                */
                this.client.emit("messageReactionAdd", message || {
                    id: packet.d.message_id,
                    channel: channel
                }, packet.d.emoji, packet.d.user_id);
                break;
            }
            case "MESSAGE_REACTION_REMOVE": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (!channel) {
                    break;
                }
                let message = channel.messages.get(packet.d.message_id);
                if (message) {
                    let reaction = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                    if (message.reactions[reaction]) {
                        --message.reactions[reaction].count;
                        if (packet.d.user_id === this.client.user.id) {
                            message.reactions[reaction].me = false;
                        }
                    }
                }
                /**
                * Fired when someone removes a reaction from a message
                * @event Hibiki#messageReactionRemove
                * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. No other property is guaranteed
                * @prop {Object} emoji The reaction emoji object
                * @prop {String?} emoji.id The ID of the emoji (null for non-custom emojis)
                * @prop {String} emoji.name The emoji name
                * @prop {String} userID The ID of the user that removed the reaction
                */
                this.client.emit("messageReactionRemove", message || {
                    id: packet.d.message_id,
                    channel: channel
                }, packet.d.emoji, packet.d.user_id);
                break;
            }
            case "MESSAGE_REACTION_REMOVE_ALL": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (!channel) {
                    break;
                }
                /**
                * Fired when someone removes a reaction from a message
                * @event Hibiki#messageReactionRemoveAll
                * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. No other property is guaranteed
                */
                this.client.emit("messageReactionRemoveAll", channel.messages.get(packet.d.message_id) || {
                    id: packet.d.message_id,
                    channel: channel
                });
                break;
            }
            case "GUILD_MEMBER_ADD": {
                let guild = this.client.guilds.get(packet.d.guild_id);
                packet.d.id = packet.d.user.id;
                ++guild.memberCount;
                /**
                * Fired when a member joins a server
                * @event Hibiki#guildMemberAdd
                * @prop {Guild} guild The guild
                * @prop {Member} member The member
                */
                this.client.emit("guildMemberAdd", guild, guild.members.add(packet.d, guild));
                break;
            }
            case "GUILD_MEMBER_UPDATE": {
                let guild = this.client.guilds.get(packet.d.guild_id);
                if (!guild) {
                    this.client.emit("warn", `Missing guild ${packet.d.guild_id} in GUILD_MEMBER_UPDATE`);
                    break;
                }
                let member = guild.members.get(packet.d.id = packet.d.user.id);
                let oldMember = null;
                if (member) {
                    oldMember = {
                        roles: member.roles,
                        nick: member.nick
                    };
                }
                member = guild.members.update(packet.d, guild);
                /**
                * Fired when a member's roles or nickname are updated
                * @event Hibiki#guildMemberUpdate
                * @prop {Guild} guild The guild
                * @prop {Member} member The updated member
                * @prop {Object?} oldMember The old member data
                * @prop {String[]} oldMember.roles An array of role IDs this member is a part of
                * @prop {String?} oldMember.nick The server nickname of the member
                */
                this.client.emit("guildMemberUpdate", guild, member, oldMember);
                break;
            }
            case "GUILD_MEMBER_REMOVE": {
                if (packet.d.user.id === this.client.user.id) { // The bot is probably leaving
                    break;
                }
                let guild = this.client.guilds.get(packet.d.guild_id);
                if (!guild) {
                    break;
                }
                --guild.memberCount;
                packet.d.id = packet.d.user.id;
                if (guild.members.get(this.client.user.id).permission.has('viewAuditLogs') || guild.members.get(this.client.user.id).permission.has('administrator')) {
                    guild.getAuditLogs(10, null, 20).then(logs => {
                        const log = logs.entries.filter(log => log.targetID === packet.d.user.id)[0];
                        if (!log) {
                            this.client.emit("guildMemberRemove", guild, guild.members.remove(packet.d) || {
                                id: packet.d.id,
                                user: new User(packet.d.user)
                            });
                        } else {
                            /**
                             * Fired when a member gets kicked from a guild
                             * @event Hibiki#guildMemberKick
                             * @prop {Guild} guild The guild
                             * @prop {Member | Object} member The member. If the member is not cached, this will be an object with `id` and `user` key
                             * @prop {Object} log The audit log
                             */
                            this.client.emit("guildMemberKick", guild, guild.members.remove(packet.d) || {
                                id: packet.d.id,
                                user: new User(packet.d.user)
                            }, log);
                        }
                    });
                } else {
                    /**
                     * Fired when a member leaves a server (or gets kicked, but the bot doesn't have permissions to view audit logs)
                     * @event Hibiki#guildMemberRemove
                     * @prop {Guild} guild The guild
                     * @prop {Member | Object} member The member. If the member is not cached, this will be an object with `id` and `user` key
                     */
                    this.client.emit("guildMemberRemove", guild, guild.members.remove(packet.d) || {
                        id: packet.d.id,
                        user: new User(packet.d.user)
                    });
                }
                break;
            }
            case "GUILD_CREATE": {
                if (!packet.d.unavailable) {
                    let guild = this.createGuild(packet.d);
                    if (this.ready) {
                        if (this.client.unavailableGuilds.remove(packet.d)) {
                            /**
                            * Fired when an guild becomes available
                            * @event Hibiki#guildAvailable
                            * @prop {Guild} guild The guild
                            */
                            this.client.emit("guildAvailable", guild);
                        } else {
                            /**
                            * Fired when an guild is created
                            * @event Hibiki#guildCreate
                            * @prop {Guild} guild The guild
                            */
                            this.client.emit("guildCreate", guild);
                        }
                    } else {
                        this.client.unavailableGuilds.remove(packet.d);
                        this.restartGuildCreateTimeout();
                    }
                } else {
                    this.client.guilds.remove(packet.d);
                    /**
                    * Fired when an unavailable guild is created
                    * @event Hibiki#unavailableGuildCreate
                    * @prop {UnavailableGuild} guild The unavailable guild
                    */
                    this.client.emit("unavailableGuildCreate", this.client.unavailableGuilds.add(packet.d, this.client));
                }
                break;
            }
            case "GUILD_UPDATE": {
                let guild = this.client.guilds.get(packet.d.id);
                let oldGuild = null;
                oldGuild = {
                    name: guild.name,
                    verificationLevel: guild.verification_level,
                    splash: guild.splash,
                    region: guild.region,
                    ownerID: guild.owner_id,
                    icon: guild.icon,
                    features: guild.features,
                    emojis: guild.emojis,
                    afkChannelID: guild.afk_channel_id,
                    afkTimeout: guild.afk_timeout
                };
                /**
                * Fired when an guild is updated
                * @event Hibiki#guildUpdate
                * @prop {Guild} guild The guild
                * @prop {Object} oldGuild The old guild data
                * @prop {String} oldGuild.name The name of the guild
                * @prop {Number} oldGuild.verificationLevel The guild verification level
                * @prop {String} oldGuild.region The region of the guild
                * @prop {String?} oldGuild.icon The hash of the guild icon, or null if no icon
                * @prop {String} oldGuild.afkChannelID The ID of the AFK voice channel
                * @prop {Number} oldGuild.afkTimeout The AFK timeout in seconds
                * @prop {String} oldGuild.ownerID The ID of the user that is the guild owner
                * @prop {String?} oldGuild.splash The hash of the guild splash image, or null if no splash (VIP only)
                * @prop {Object[]} oldGuild.features An array of guild features
                * @prop {Object[]} oldGuild.emojis An array of guild emojis
                */
                this.client.emit("guildUpdate", this.client.guilds.update(packet.d, this.client), oldGuild);
                break;
            }
            case "GUILD_DELETE": {
                let voiceConnection = this.client.voiceConnections.get(packet.d.id);
                if (voiceConnection) {
                    this.client.leaveVoiceChannel(voiceConnection.channelID);
                }

                delete this.client.guildShardMap[packet.d.id];
                let guild = this.client.guilds.remove(packet.d);
                if (guild) { // Discord sends GUILD_DELETE for guilds that were previously unavailable in READY
                    guild.channels.forEach((channel) => {
                        delete this.client.channelGuildMap[channel.id];
                    });
                }
                if (packet.d.unavailable) {
                    /**
                    * Fired when an guild becomes unavailable
                    * @event Hibiki#guildUnavailable
                    * @prop {Guild} guild The guild
                    */
                    this.client.emit("guildUnavailable", this.client.unavailableGuilds.add(packet.d, this.client));
                } else {
                    /**
                    * Fired when an guild is deleted
                    * @event Hibiki#guildDelete
                    * @prop {Guild} guild The guild
                    */
                    this.client.emit("guildDelete", guild || {
                        id: packet.d.id
                    });
                }
                break;
            }
            case "GUILD_BAN_ADD": {
                /**
                * Fired when a user is banned from a guild
                * @event Hibiki#guildBanAdd
                * @prop {Guild} guild The guild
                * @prop {User} user The banned user
                */
                this.client.emit("guildBanAdd", this.client.guilds.get(packet.d.guild_id), this.client.users.add(packet.d.user, this.client));
                break;
            }
            case "GUILD_BAN_REMOVE": {
                /**
                * Fired when a user is unbanned from a guild
                * @event Hibiki#guildBanRemove
                * @prop {Guild} guild The guild
                * @prop {User} user The banned user
                */
                this.client.emit("guildBanRemove", this.client.guilds.get(packet.d.guild_id), this.client.users.add(packet.d.user, this.client));
                break;
            }
            case "GUILD_ROLE_CREATE": {
                /**
                * Fired when a guild role is created
                * @event Hibiki#guildRoleCreate
                * @prop {Guild} guild The guild
                * @prop {Role} role The role
                */
                let guild = this.client.guilds.get(packet.d.guild_id);
                this.client.emit("guildRoleCreate", guild, guild.roles.add(packet.d.role, guild));
                break;
            }
            case "GUILD_ROLE_UPDATE": {
                let guild = this.client.guilds.get(packet.d.guild_id);
                let role = guild.roles.add(packet.d.role, guild);
                let oldRole = null;
                if (role) {
                    oldRole = {
                        color: role.color,
                        hoist: role.hoist,
                        managed: role.managed,
                        name: role.name,
                        permissions: role.permissions,
                        position: role.position
                    };
                }
                /**
                * Fired when a guild role is updated
                * @event Hibiki#guildRoleUpdate
                * @prop {Guild} guild The guild
                * @prop {Role} role The updated role
                * @prop {Object} oldRole The old role data
                * @prop {String} oldRole.name The name of the role
                * @prop {Boolean} oldRole.managed Whether a guild integration manages this role or not
                * @prop {Boolean} oldRole.hoist Whether users with this role are hoisted in the user list or not
                * @prop {Number} oldRole.color The hex color of the role in base 10
                * @prop {Number} oldRole.position The position of the role
                * @prop {Permission} oldRole.permissions The permissions number of the role
                */
                this.client.emit("guildRoleUpdate", guild, guild.roles.update(packet.d.role, guild), oldRole);
                break;
            }
            case "GUILD_ROLE_DELETE": {
                /**
                * Fired when a guild role is deleted
                * @event Hibiki#guildRoleDelete
                * @prop {Guild} guild The guild
                * @prop {Role} role The role
                */
                let guild = this.client.guilds.get(packet.d.guild_id);
                if (guild) { // Eventual Consistency™ (╯°□°）╯︵ ┻━┻
                    this.client.emit("guildRoleDelete", guild, guild.roles.remove({ id: packet.d.role_id }));
                }
                break;
            }
            case "CHANNEL_CREATE": {
                if (packet.d.type === undefined || packet.d.type === 1) {
                    if (this.id === 0) {
                        /**
                        * Fired when a channel is created
                        * @event Hibiki#channelCreate
                        * @prop {Channel} channel The channel
                        */
                        this.client.privateChannelMap[packet.d.recipients[0].id] = packet.d.id;
                        this.client.emit("channelCreate", this.client.privateChannels.add(packet.d, this.client));
                    }
                } else if (packet.d.type === 0 || packet.d.type === 2) {
                    let guild = this.client.guilds.get(packet.d.guild_id);
                    if (!guild) {
                        break;
                    }
                    let channel = guild.channels.add(packet.d, guild);
                    this.client.channelGuildMap[packet.d.id] = packet.d.guild_id;
                    this.client.emit("channelCreate", channel);
                } else if (packet.d.type === 3) {
                    if (this.id === 0) {
                        this.client.emit("channelCreate", this.client.groupChannels.add(packet.d, this.client));
                    }
                } else {
                    this.emit("error", new Error("Unhandled CHANNEL_CREATE type: " + JSON.stringify(packet, null, 2)));
                }
                break;
            }
            case "CHANNEL_UPDATE": {
                let channel = this.client.getChannel(packet.d.id);
                let oldChannel;
                if (!channel) {
                    break;
                }
                if (channel.type === 3) {
                    if (this.id !== 0) {
                        break;
                    }
                    oldChannel = {
                        name: channel.name,
                        ownerID: channel.ownerID,
                        icon: channel.icon
                    };
                }
                if (channel.type === 0 || channel.type === 2) {
                    oldChannel = {
                        name: channel.name,
                        topic: channel.topic,
                        position: channel.position,
                        bitrate: channel.bitrate,
                        permissionOverwrites: channel.permissionOverwrites
                    };
                }
                channel.update(packet.d);
                /**
                * Fired when a channel is updated
                * @event Hibiki#channelUpdate
                * @prop {Channel} channel The updated channel
                * @prop {Object} oldChannel The old channel data
                * @prop {String} oldChannel.name The name of the channel
                * @prop {Number} oldChannel.position The position of the channel
                * @prop {String?} oldChannel.topic The topic of the channel (text channels only)
                * @prop {Number?} oldChannel.bitrate The bitrate of the channel (voice channels only)
                * @prop {Collection} oldChannel.permissionOverwrites Collection of PermissionOverwrites in this channel
                */
                this.client.emit("channelUpdate", channel, oldChannel);
                break;
            }
            case "CHANNEL_DELETE": {
                if (packet.d.type === 1 || packet.d.type === undefined) {
                    if (this.id === 0) {
                        let channel = this.client.privateChannels.remove(packet.d);
                        if (channel) {
                            delete this.client.privateChannelMap[channel.recipient.id];
                            /**
                            * Fired when a channel is deleted
                            * @event Hibiki#channelDelete
                            * @prop {Channel} channel The channel
                            */
                            this.client.emit("channelDelete", channel);
                        }
                    }
                } else if (packet.d.type === 0 || packet.d.type === 2) {
                    delete this.client.channelGuildMap[packet.d.id];
                    let channel = this.client.guilds.get(packet.d.guild_id).channels.remove(packet.d);
                    if (!channel) {
                        break;
                    }
                    if (channel.type === 2) {
                        channel.voiceMembers.forEach((member) => {
                            this.client.emit("voiceChannelLeave", channel.voiceMembers.remove(member), channel);
                        });
                    }
                    this.client.emit("channelDelete", channel);
                } else if (packet.d.type === 3) {
                    if (this.id === 0) {
                        this.client.emit("channelDelete", this.client.groupChannels.remove(packet.d));
                    }
                } else {
                    this.emit("error", new Error("Unhandled CHANNEL_DELETE type: " + JSON.stringify(packet, null, 2)));
                }
                break;
            }
            case "CALL_CREATE": {
                packet.d.id = packet.d.message_id;
                let channel = this.client.getChannel(packet.d.channel_id);
                if (channel.call) {
                    channel.call.update(packet.d);
                } else {
                    channel.call = new Call(packet.d, channel);
                    let incrementedID = "";
                    let overflow = true;
                    let chunks = packet.d.id.match(/\d{1,9}/g).map((chunk) => parseInt(chunk));
                    for (let i = chunks.length - 1; i >= 0; --i) {
                        if (overflow) {
                            ++chunks[i];
                            overflow = false;
                        }
                        if (chunks[i] > 999999999) {
                            overflow = true;
                            incrementedID = "000000000" + incrementedID;
                        } else {
                            incrementedID = chunks[i] + incrementedID;
                        }
                    }
                    if (overflow) {
                        incrementedID = overflow + incrementedID;
                    }
                    this.client.getMessages(channel.id, 1, incrementedID);
                }
                /**
                * Fired when a call is created
                * @event Hibiki#callCreate
                * @prop {Call} call The call
                */
                this.client.emit("callCreate", channel.call);
                break;
            }
            case "CALL_UPDATE": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (!channel.call) {
                    throw new Error("CALL_UPDATE but channel has no call");
                }
                let oldCall = {
                    participants: channel.call.participants,
                    ringing: channel.call.ringing,
                    region: channel.call.region,
                    endedTimestamp: channel.call.endedTimestamp,
                    unavailable: channel.call.unavailable,
                };
                /**
                * Fired when a call is updated
                * @event Hibiki#callUpdate
                * @prop {Call} call The updated call
                * @prop {Object} oldCall The old call data
                * @prop {String[]} oldCall.participants The IDs of the call participants
                * @prop {Number?} oldCall.endedTimestamp The timestamp of the call end
                * @prop {String[]?} oldCall.ringing The IDs of people that were being rung
                * @prop {String?} oldCall.region The region of the call server
                * @prop {Boolean} oldCall.unavailable Whether the call was unavailable or not
                */
                this.client.emit("callUpdate", channel.call.update(packet.d), oldCall);
                break;
            }
            case "CALL_DELETE": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (!channel.call) {
                    throw new Error("CALL_DELETE but channel has no call");
                }
                channel.lastCall = channel.call;
                channel.call = null;
                /**
                * Fired when a call is deleted
                * @event Hibiki#callDelete
                * @prop {Call} call The call
                */
                this.client.emit("callDelete", channel.lastCall);
                break;
            }
            case "CHANNEL_RECIPIENT_ADD": {
                let channel = this.client.groupChannels.get(packet.d.channel_id);
                /**
                * Fired when a user joins a group channel
                * @event Hibiki#channelRecipientAdd
                * @prop {GroupChannel} channel The channel
                * @prop {User} user The user
                */
                this.client.emit("channelRecipientAdd", channel, channel.recipients.add(this.client.users.add(packet.d.user, this.client)));
                break;
            }
            case "CHANNEL_RECIPIENT_REMOVE": {
                let channel = this.client.groupChannels.get(packet.d.channel_id);
                /**
                * Fired when a user leaves a group channel
                * @event Hibiki#channelRecipientRemove
                * @prop {GroupChannel} channel The channel
                * @prop {User} user The user
                */
                this.client.emit("channelRecipientRemove", channel, channel.recipients.remove(packet.d.user));
                break;
            }
            case "FRIEND_SUGGESTION_CREATE": {
                /**
                * Fired when a client receives a friend suggestion
                * @event Hibiki#friendSuggestionCreate
                * @prop {User} user The suggested user
                * @prop {String[]} reasons Array of reasons why this suggestion was made
                * @prop {Number} reasons.type Type of reason?
                * @prop {String} reasons.platform_type Platform you share with the user
                * @prop {String} reasons.name Username of suggested user on that platform
                */
                this.client.emit("friendSuggestionCreate", new User(packet.d.suggested_user), packet.d.reasons);
                break;
            }
            case "FRIEND_SUGGESTION_DELETE": {
                /**
                * Fired when a client's friend suggestion is removed for any reason
                * @event Hibiki#friendSuggestionDelete
                * @prop {User} user The suggested user
                */
                this.client.emit("friendSuggestionDelete", this.client.users.get(packet.d.suggested_user_id));
                break;
            }
            case "GUILD_MEMBERS_CHUNK": {
                let guild = this.client.guilds.get(packet.d.guild_id);
                if (this.getAllUsersCount.hasOwnProperty(guild.id)) {
                    if (this.getAllUsersCount[guild.id] <= 1) {
                        delete this.getAllUsersCount[guild.id];
                        this.checkReady();
                    } else {
                        --this.getAllUsersCount[guild.id];
                    }
                }

                /**
                 * Fired when Discord sends member chunks
                 * @event Hibiki#guildMemberChunk
                 * @prop {Guild} guild The guild the chunked members are in
                 * @prop {Array<Member>} members The members in the chunk
                 */
                this.client.emit("guildMemberChunk", guild, packet.d.members.map((member) => {
                    member.id = member.user.id;
                    return guild.members.add(member, guild);
                }));

                this.lastHeartbeatAck = true;

                // debugStr = " | " + packet.d.members.length + " members | " + guild.id;

                break;
            }
            case "GUILD_SYNC": {// (╯°□°）╯︵ ┻━┻ thx Discord devs
                let guild = this.client.guilds.get(packet.d.id);
                for (let member of packet.d.members) {
                    member.id = member.user.id;
                    guild.members.add(member, guild);
                }
                for (let presence of packet.d.presences) {
                    if (!guild.members.get(presence.user.id)) {
                        let userData = this.client.users.get(presence.user.id);
                        if (userData) {
                            userData = `{username: ${userData.username}, id: ${userData.id}, discriminator: ${userData.discriminator}}`;
                        }
                        this.client.emit("debug", `Presence without member. ${presence.user.id}. In global user cache: ${userData}. ` + JSON.stringify(presence), this.id);
                        continue;
                    }
                    presence.id = presence.user.id;
                    guild.members.update(presence);
                }
                if (guild.pendingVoiceStates && guild.pendingVoiceStates.length > 0) {
                    for (let voiceState of guild.pendingVoiceStates) {
                        if (!guild.members.get(voiceState.user_id)) {
                            continue;
                        }
                        voiceState.id = voiceState.user_id;
                        let channel = guild.channels.get(voiceState.channel_id);
                        if (channel) {
                            channel.voiceMembers.add(guild.members.update(voiceState));
                            if (this.client.options.seedVoiceConnections && voiceState.id === this.client.user.id && !this.client.voiceConnections.get(channel.guild ? channel.guild.id : "call")) {
                                this.client.joinVoiceChannel(channel.id, false);
                            }
                        } else { // Phantom voice states from connected users in deleted channels (╯°□°）╯︵ ┻━┻
                            this.client.emit("warn", "Phantom voice state received but channel not found | Guild: " + guild.id + " | Channel: " + voiceState.channel_id);
                        }
                    }
                }
                guild.pendingVoiceStates = null;
                --this.unsyncedGuilds;
                this.checkReady();
                break;
            }
            case "RESUMED":
            case "READY": {
                this.connectAttempts = 0;
                this.reconnectInterval = 1000;

                this.connecting = false;
                this.status = "connected";
                this.presence.status = "online";
                this.client.shards._readyPacketCB();

                if (packet.t === "RESUMED") {
                    this.preReady = true;
                    this.ready = true;

                    /**
                    * Fired when a shard finishes resuming
                    * @event Shard#resume
                    * @prop {Number} id The ID of the shard
                    */
                    this.emit("resume", this.id); // abalpls
                    break;
                }

                this.client.user = this.client.users.add(new ExtendedUser(packet.d.user, this.client), this.client);
                if (this.client.user.bot) {
                    this.client.bot = true;
                    if (!this.client.token.startsWith("Bot ")) {
                        this.client.token = "Bot " + this.client.token;
                    }
                } else {
                    this.client.bot = false;
                    this.client.userGuildSettings = {};
                    packet.d.user_guild_settings.forEach((guildSettings) => {
                        this.client.userGuildSettings[guildSettings.guild_id] = guildSettings;
                    });
                    this.client.userSettings = packet.d.user_settings;
                }

                if (packet.d._trace) {
                    this.discordServerTrace = packet.d._trace;
                }

                this.sessionID = packet.d.session_id;

                packet.d.guilds.forEach((guild) => {
                    if (guild.unavailable) {
                        this.client.guilds.remove(guild);
                        this.client.unavailableGuilds.add(guild, this.client, true);
                    } else {
                        this.client.unavailableGuilds.remove(this.createGuild(guild));
                    }
                });

                packet.d.private_channels.forEach((channel) => {
                    if (channel.type === undefined || channel.type === 1) {
                        this.client.privateChannelMap[channel.recipients[0].id] = channel.id;
                        this.client.privateChannels.add(channel, this.client, true);
                    } else if (channel.type === 3) {
                        this.client.groupChannels.add(channel, this.client, true);
                    } else {
                        this.emit("error", new Error("Unhandled READY private_channel type: " + JSON.stringify(channel, null, 2)));
                    }
                });

                if (packet.d.relationships) {
                    packet.d.relationships.forEach((relationship) => {
                        this.client.relationships.add(relationship, this.client, true);
                    });
                }

                if (packet.d.presences) {
                    packet.d.presences.forEach((presence) => {
                        if (this.client.relationships.get(presence.user.id)) { // Avoid DM channel presences which are also in here
                            presence.id = presence.user.id;
                            this.client.relationships.update(presence, null, true);
                        }
                    });
                }

                if (packet.d.notes) {
                    this.client.notes = packet.d.notes;
                }

                this.preReady = true;
                /**
                * Fired when a shard finishes processing the ready packet
                * @event Hibiki#shardPreReady
                * @prop {Number} id The ID of the shard
                */
                this.client.emit("shardPreReady", this.id);

                if (this.client.unavailableGuilds.size > 0 && packet.d.guilds.length > 0) {
                    this.restartGuildCreateTimeout();
                } else {
                    this.checkReady();
                }

                // debugStr = " | " + packet.d.guilds.length + " guilds";

                break;
            }
            case "VOICE_SERVER_UPDATE": {
                packet.d.session_id = this.sessionID;
                packet.d.user_id = this.client.user.id;
                packet.d.shard = this;
                this.client.voiceConnections.voiceServerUpdate(packet.d);
                break;
            }
            case "USER_UPDATE": {
                let user = this.client.users.get(packet.d.id);
                let oldUser = {
                    username: user.username,
                    discriminator: user.discriminator,
                    avatar: user.avatar
                };
                this.client.emit("userUpdate", user.update(packet.d), oldUser);
                break;
            }
            case "RELATIONSHIP_ADD": {
                if (this.client.bot) {
                    break;
                }
                let relationship = this.client.relationships.get(packet.d.id);
                if (relationship) {
                    let oldRelationship = {
                        type: relationship.type
                    };
                    /**
                    * Fired when a relationship is updated
                    * @event Hibiki#relationshipUpdate
                    * @prop {Relationship} relationship The relationship
                    * @prop {Object} oldRelationship The old relationship data
                    * @prop {Number} oldRelationship.type The old type of the relationship
                    */
                    this.client.emit("relationshipUpdate", this.client.relationships.update(packet.d), oldRelationship);
                } else {
                    /**
                    * Fired when a relationship is added
                    * @event Hibiki#relationshipAdd
                    * @prop {Relationship} relationship The relationship
                    */
                    this.client.emit("relationshipAdd", this.client.relationships.add(packet.d, this.client));
                }
                break;
            }
            case "RELATIONSHIP_REMOVE": {
                if (this.client.bot) {
                    break;
                }
                /**
                * Fired when a relationship is removed
                * @event Hibiki#relationshipRemove
                * @prop {Relationship} relationship The relationship
                */
                this.client.emit("relationshipRemove", this.client.relationships.remove(packet.d));
                break;
            }
            case "GUILD_EMOJIS_UPDATE": {
                let guild = this.client.guilds.get(packet.d.guild_id);
                let oldEmojis = guild.emojis;
                guild.update(packet.d);
                /**
                * Fired when a guild's emojis are updated
                * @event Hibiki#guildEmojisUpdate
                * @prop {Guild} guild The guild
                * @prop {Array} emojis The updated emojis of the guild
                * @prop {Array} oldEmojis The old emojis of the guild
                */
                this.client.emit("guildEmojisUpdate", guild, guild.emojis, oldEmojis);
                break;
            }
            case "CHANNEL_PINS_UPDATE": {
                let channel = this.client.getChannel(packet.d.channel_id);
                if (!channel) {
                    this.client.emit("debug", `CHANNEL_PINS_UPDATE target channel ${packet.d.channel_id} not found`);
                    break;
                }
                let oldTimestamp = channel.lastPinTimestamp;
                channel.lastPinTimestamp = Date.parse(packet.d.timestamp);
                /**
                * Fired when a channel pin timestamp is updated
                * @event Hibiki#channelPinUpdate
                * @prop {Channel} channel The channel
                * @prop {Number} timestamp The new timestamp
                * @prop {Number} oldTimestamp The old timestamp
                */
                this.client.emit("channelPinUpdate", channel, channel.lastPinTimestamp, oldTimestamp);
                break;
            }
            case "PRESENCES_REPLACE": {
                for (let presence of packet.d) {
                    let guild = this.client.guilds.get(presence.guild_id);
                    if (!guild) {
                        this.client.emit("warn", "Rogue presences replace: " + JSON.stringify(presence), this.id);
                        continue;
                    }
                    let member = guild.members.get(presence.user.id);
                    if (!member && presence.user.username) {
                        presence.id = presence.user.id;
                        member.update(presence);
                    }
                }
                break;
            }
            case "USER_NOTE_UPDATE": {
                if (packet.d.note) {
                    this.client.notes[packet.d.id] = packet.d.note;
                } else {
                    this.client.notes[packet.d.id];
                }
                break;
            }
            case "USER_GUILD_SETTINGS_UPDATE": {
                this.client.userGuildSettings[packet.d.guild_id] = packet.d;
                break;
            }
            case "MESSAGE_ACK": // Ignore these
            case "GUILD_INTEGRATIONS_UPDATE":
            case "USER_SETTINGS_UPDATE":
            case "CHANNEL_PINS_ACK": {
                break;
            }
            default: {
                /**
                * Fired when the shard encounters an unknown packet
                * @event Hibiki#unknown
                * @prop {Object} packet The unknown packet
                * @prop {Number} id The ID of the shard
                */
                this.client.emit("unknown", packet, this.id);
                break;
            }
        } /* eslint-enable no-redeclare */
    }

}

module.exports = Shard;