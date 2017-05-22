const Client = require(`${__dirname}/Hibiki.js`);

function Hibiki(token, options) {
    if (!token) throw new Error("No token given.");
    return new Client(token, options);
}

Hibiki.Client = Client;
Hibiki.Message = require('./structures/Message.js');
Hibiki.Channel = require('./structures/Channel.js');
Hibiki.User = require('./structures/User.js');
Hibiki.Ctx = require('./structures/Ctx.js');
Hibiki.Command = require('./structures/Command.js');
Hibiki.Cache = require('./structures/Cache.js');
Hibiki.Manager = require('./managers/Manager.js');
Hibiki.CommandManager = require('./managers/CommandManager.js');
Hibiki.DiscordBots = require('./utils/DiscordBots.js');
Hibiki.DatabaseConnection = require('./structures/DatabaseConnection.js');

module.exports = Hibiki;