const Collection = require('../util/Collection.js');
const MusicPlayer = require('../structures/MusicPlayer.js')

class PlayerManager extends Collection {
    constructor(client) {
        super(MusicPlayer);
        this._client = client;
        this.logger = client.logger;
    }

    /**
     * Spawns a new music player
     * 
     * @param {Message?} msg Message that was used to add the player
     * @param {Guild?} guild Guild of the music player
     * @param {String} vc ID of the voice channel to join
     * 
     * @memberof PlayerManager
     */

    spawn(msg) {
        const guild = msg.guild;
        const player = this.add(new MusicPlayer(this._client, guild));

        player.checkQueue().then(() => {

            player.on('ready', () => this.logger.info(`Player with id ${guild.id} is ready!`));

            player.on('next', (song) => msg.channel.createMessage({
                embed: {
                    title: song.title,
                    image: {
                        thumbnail: song.thumbnail
                    },
                    footer: {
                        text: `Requested by: ${this._client.users.get(song.user).tag}`
                    }
                }
            }))

            player.on('error', (err) => msg.channel.createMessage(`\`\`\`diff\n- ${err.stack}\`\`\``))

            player.on('pause', () => msg.channel.createMessage('Paused current song'));

            player.on('resume', () => msg.channel.createMessage(`Resumed current song.`));

            player.on('notConnected', () => msg.channel.createMessage(`I'm not connected to a voice channel!`));

            player.on('notReady', () => msg.channel.createMessage(`I'm not ready yet!`));

            player.on('queueEmpty', () => msg.channel.createMessage(`The queue is empty!`));

        });

        return player;

    }

    delete(id) {
        return new Promise((resolve, reject) => {
            if (!this.has(id)) return reject(new Error("Music player not found"));
            this.get(id).stop().then(() => this.remove({ id: id }).then(resolve));
        });
    }
}

module.exports = PlayerManager;