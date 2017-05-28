global.__base = __dirname;
global.__languages = `${__dirname}/languages`;
global.__commands = `${__dirname}/commands`;

const fs = require('fs');
const Hibiki = require(`${__dirname}/../../`);

if (!fs.existsSync(`${__dirname}/config.json`)) throw new Error(`Couldn't find config.json, be sure to rename config.example.json to config.json after editing it.`);

const config = require(`${__dirname}/config.json`);
const qt = new Hibiki.Client(config.token, config.hibiki, config.eris);
const logger = qt.logger;

qt.on('ready', () => {
    logger.info(`Connected to Discord!`);
    qt.cm.loadAll();
});
qt.on('messageCreate', (msg) => {
    qt.cm.check(msg);
});

qt.on('commandLoaded', (cmd) => {
    logger.custom({ color: 'black', bgColor: 'green', name: 'SUCCESS' }, 'Command loaded:', cmd)
})

qt.on('error', logger.error)

qt.connect();