const Client = require(`./Hibiki.js`);

function Hibiki(token, options) {
    if (!token) throw new Error("No token given.");
    return new Client(token, options);
}

Hibiki.Client = Client;
Hibiki.Message = require('./structures/Message.js');
Hibiki.Channel = require('./structures/Channel.js');
Hibiki.User = require('./structures/User.js');
Hibiki.Base = require('./structures/Base.js');
Hibiki.GuildChannel = require('./structures/GuildChannel.js');
Hibiki.GroupChannel = require('./structures/GroupChannel.js');
Hibiki.PrivateChannel = require('./structures/PrivateChannel.js');
Hibiki.Role = require('./structures/Role.js');
Hibiki.Call = require('./structures/Call.js');
Hibiki.Member = require('./structures/Member.js');
Hibiki.Guild = require('./structures/Guild.js');
Hibiki.GuildAuditLogEntry = require('./structures/GuildAuditLogEntry.js');
Hibiki.GuildIntegration = require('./structures/GuildIntegration.js');
Hibiki.Permission = require('./structures/Permission.js');
Hibiki.PermissionOverwrite = require('./structures/PermissionOverwrite.js');
Hibiki.Invite = require('./structures/Invite.js');
Hibiki.ShardManager = require('./gateway/ShardManager.js');
Hibiki.Shard = require('./gateway/Shard.js');
Hibiki.SharedStream = require('./voice/SharedStream.js');
Hibiki.VoiceConnection = require('./voice/VoiceConnection.js');
Hibiki.VoiceConnectionManager = require('./voice/VoiceConnectionManager.js');
Hibiki.VoiceDataStream = require('./voice/VoiceDataStream.js');
Hibiki.VoiceState = require('./structures/VoiceState.js');
Hibiki.Relationship = require('./structures/Relationship.js');
Hibiki.Constants = require('./Constants.js');
Hibiki.Bucket = require('./util/Bucket.js');
Hibiki.Collection = require('./util/Collection.js');
Hibiki.MultipartData = require('./util/MultipartData.js');
Hibiki.SequentialBucket = require('./util/SequentialBucket.js');
Hibiki.Endpoints = require('./rest/Endpoints.js');
Hibiki.RequestHandler = require('./rest/RequestHandler.js');
Hibiki.ExtendedUser = require('./structures/ExtendedUser.js');
Hibiki.UnavailableGuild = require('./structures/UnavailableGuild.js');
Hibiki.Piper = require('./voice/Piper.js');

//Hibiki.TestCtx = require('./structures/TestCtx.js');
Hibiki.Logger = require('./structures/Logger.js');
Hibiki.Ctx = require('./structures/Ctx.js');
Hibiki.Command = require('./structures/Command.js');
Hibiki.Cache = require('./structures/Cache.js');
Hibiki.Manager = require('./managers/Manager.js');
Hibiki.CommandManager = require('./managers/CommandManager.js');
Hibiki.DatabaseConnection = require('./structures/DatabaseConnection.js');

module.exports = Hibiki;