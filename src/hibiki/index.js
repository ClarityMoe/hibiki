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
    qt.lm.loadAll();
    qt.cm.loadAll();
});
qt.on('messageCreate', (msg) => {
    qt.ch.check(msg);
});

qt.on('cogLoaded', (cmd) => {
    logger.custom({ color: 'black', bgColor: 'green', name: 'SUCCESS' }, 'Cog loaded:', cmd);
});

qt.on('localeLoaded', (locale) => {
    logger.custom({ color: 'black', bgColor: 'green', name: 'SUCCESS' }, 'Locale loaded:', locale);
});

qt.on('error', e => logger.error(e.stack));
qt.on('warn', logger.warn);

qt.connect();