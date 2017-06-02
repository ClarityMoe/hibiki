const Manager = require('./Manager.js');
//const TestCtx = require('../structures/TestCtx.js');
const Ctx = require('../structures/Ctx.js');
const rreaddir = require('recursive-readdir');
const exec = require('child_process').exec;
const minimist = require('minimist');
const fs = require('fs');

class CommandManager extends Manager {
    constructor(client, options) {
        super(client, options);
        this.cogDir = options.cogDir;
        this.aliases = {};
        this.cogs = {};
        this.__base = options.__base;
    }

    loadAll() {
        rreaddir(`${process.cwd()}/${this.cogDir}`, (err, files) => {
            if (err) return this.logger.error(`Error while trying to load cogs:`, err);
            for (const file of files) {
                if (!file.endsWith('package.json')) continue;

                let cog = {};
                let pkg;
                const deps = [];
                const _pkg = fs.readFileSync(file);

                if (!_pkg) { // If the package.json file is empty just error and go to the next one
                    this.logger.error(`${file}:`, 'package.json is empty!');
                    continue;
                }

                try { 
                    pkg = JSON.parse(_pkg); // Parse the raw text
                } catch (e) {
                    this.logger.error(`${file}:`, e); // If any error occurs we log it and continue
                    continue;
                }

                if (!pkg.name || !pkg.main && !pkg.scripts || !pkg.description || !pkg.author || !pkg.version || !pkg.dependencies) { // We need a valid package.json for the cog to load
                    this.logger.error(`${file}:`, 'invalid package.json');
                    continue;
                }

                if (this.cogs.hasOwnProperty(pkg.name)) { // dupes >.>
                    this.logger.custom({
                        bgColor: 'yellow',
                        name: 'DUPE',
                        color: 'black'
                    }, `${file}:`, 'Duplicate cog!');
                    continue;
                }

                if (Object.keys(pkg.dependencies).length > 0) { // Checking for dependencies
                    for (const dep of Object.keys(pkg.dependencies)) {
                        try {
                            require.resolve(dep); // Check if the dependency is already installed
                        } catch (e) {
                            if (!deps.includes(dep)) deps.push(pkg.dependencies[dep].indexOf('^') > -1 ? dep : `${dep}@${pkg.dependencies[dep]}`); // If theres a specific version we need, use that
                        }
                    }
                }

                if (deps.length > 0) { // Here we're installing the dependencies (if there are any)
                    exec(`npm i ${deps.join(' ')}`, (e, stdout, stderr) => {
                        if (stderr) this.logger.error(`${file}:`, 'Error while installing dependencies:', stderr); // Oh no! an error :<
                        else {
                            this.logger.custom({ name: 'SUCCESS', bgColor: 'green', color: 'black' }, `${file}:`, 'Packages installed successfully'); // If there are no errors we can safely assume the deps installed successfully
                            this.logger.debug(stdout);
                        }
                    });
                }

                cog.pkg = pkg;
                cog.name = pkg.displayName || pkg.name;
                cog.path = file.replace('package.json', '');
                cog.main = pkg.main || null;
                cog.scripts = pkg.scripts
                cog.category = pkg.categories[0] || pkg.category || 'unknown';
                cog.version = pkg.version || '0.0.1';
                cog.author = pkg.author && pkg.author.name || pkg.author || 'unknown';
                cog.contributors = pkg.contributors || [];
                cog.hidden = pkg.private || pkg.hidden || false;
                cog.scripts = {};

                try {
                    if (pkg.main) { // If theres a command, load it
                        try {
                            delete require.cache[require.resolve(file.replace('package.json', pkg.main))];
                        } catch (e) { // Assume the command wasnt loaded before
                        }
                        
                        const Command = require(file.replace('package.json', pkg.main));
                        let cmd;
                        
                        try {
                            cmd = new Command(this.client); // Constructing the command
                        } catch (e) {
                            this.logger.error(`${file.replace('package.json', pkg.main)}:`, 'Error while constructing command:', e); // dw if you did a bad, we log it
                            continue;
                        }

                        if (!cmd.run) {
                            this.logger.error(`${file.replace('package.json', pkg.main)}:`, 'Couldn\'t find a run function!'); // lol
                            continue;
                        }

                        if (cmd.aliases.length > 0) {
                            for (const alias of cmd.aliases) {
                                if (!this.aliases.hasOwnProperty(alias)) {
                                    this.aliases[alias] = cog.name;
                                }
                            }
                        }

                        // TODO: Add TestCtx check for memecode

                        cog.command = cmd;
                    }

                    if (pkg.scripts && Object.keys(pkg.scripts).length > 0) { // If there are any scripts, load them
                        for (const script of Object.keys(pkg.scripts)) {
                            try {
                                delete require.cache[require.resolve(file.replace('package.json', pkg.scripts[script]))];
                            } catch (e) { // Assume the script wasnt loaded before
                            }
                            const Script = require(file.replace('package.json', pkg.scripts[script]));
                            let mod;
                            try {
                                mod = new Script(this.client);
                            } catch (e) {
                                this.logger.error(`${file.replace('package.json', pkg.scripts[script])}:`, 'Error while constructing script:', e);
                                continue;
                            }

                            if (!mod.init) {
                                this.logger.error(`${file.replace('package.json', pkg.scripts[script])}:`, 'Couldn\'t find an init function!'); // lol
                                continue;
                            }

                            cog.scripts[script] = mod;
                        }
                    }

                    this.client.emit('cogLoaded', cog.name, cog);

                } catch (e) {
                    this.logger.error(`${file}:`, 'Error while initializing cog:', e); // you did a bad :<
                    continue;
                }
            }
        });
    }

    loadAll() {
        rreaddir(`${process.cwd()}/${this.commandDir}`, (err, files) => {
            if (err) return this.logger.error(err);
            for (const file of files) {
                if (!file.endsWith('package.json')) continue;
                let cmd;
                let pkg;
                const nya = [];
                try {
                    pkg = require(file);
                } catch (e) {
                    this.logger.error(`${file}: couldn't load package: ${e}`);
                }

                if (!pkg || !pkg.main || !fs.existsSync(file.replace('package.json', pkg.main) || !pkg.name || !pkg.description)) {
                    this.logger.error(`${file}: invalid package.json`);
                    continue
                };

                if (pkg.dependencies && Object.keys(pkg.dependencies)) {
                    for (const awau of Object.keys(pkg.dependencies)) {
                        try {
                            require.resolve(awau);
                        } catch (e) {
                            if (!nya.includes(awau)) nya.push(awau);
                        }
                    }
                    exec(`npm i ${nya.join(' ')}`, (err, stdout, stderr) => {
                        if (err) return this.logger.error(`Error while installing packages: ${err}`);
                        if (stderr) return this.logger.error(`Error while installing packages: ${stderr}`);
                    });
                }

                if (this.commands.hasOwnProperty(pkg.name)) {
                    this.logger.warn(`Duplicate command: ${pkg.name} (${file})`);
                    continue;
                }

                try {
                    try {
                        delete require.cache[require.resolve(file.replace('package.json', pkg.main))];
                    } catch (e) { // Assume the module wasn't loaded before.
                    }
                    const Command = require(file.replace('package.json', pkg.main));
                    try {
                        cmd = new Command(this.client);
                    } catch (e) { // I assume you forgot to add module.exports.
                    }
                    if (!cmd) {
                        this.logger.error(`Couldn't load command ${pkg.name}, did you forget to add module.exports?`);
                        continue;
                    }

                    if (!cmd.run) {
                        this.logger.error(`Couldn't find the run function for command ${pkg.name}`);
                        continue;
                    }

                    cmd.path = file.replace('package.json', '');
                    cmd.main = pkg.main;
                    cmd.name = cmd.name || pkg.name;
                    cmd.cooldown = cmd.cooldown || 5000;
                    cmd.check = cmd.check || true;
                    cmd.version = cmd.version || pkg.version;
                    cmd.description = cmd.description || pkg.description;
                    cmd.contributors = cmd.contributors || pkg.contributors || [];
                    cmd.author = cmd.author || pkg.author && pkg.author.name || pkg.author || 'unknown';
                    cmd.private = cmd.private || pkg.private || false;
                    cmd.hidden = cmd.hidden || pkg.hidden || false;
                    cmd.category = cmd.category || pkg.category;

                    if (cmd.check) {
                        if (cmd.run.toString().indexOf('eval') > -1 && !cmd.dev) {
                            this.logger.error(`Run function for command ${cmd.name} contains an eval function, but it's not listed as dev command.\nYou can disable this check by adding \`this.check = false;\` to the command.`);
                            continue;
                        }
                        if (cmd.run.toString().indexOf('this.client.token') > -1 && !cmd.dev) {
                            this.logger.error(`this.client.token :ThoughTs:`);
                            continue
                        }
                    }

                    if (cmd.aliases.length > 0) {
                        for (const alias of cmd.aliases) {
                            if (!this.aliases.hasOwnProperty(alias)) {
                                this.aliases[alias] = cmd.name;
                            }
                        }
                    }

                    this.commands[cmd.name] = cmd;
                    this.client.emit('commandLoaded', cmd.name, cmd);

                    //TODO: Complete TestCtx to test for memecode
                    //if (!cmd.cantTestThis) cmd.run(new TestCtx());
                } catch (e) {
                    this.logger.error(`${file}:`, e);
                }
            }
        });
    }
}

module.exports = CommandManager;