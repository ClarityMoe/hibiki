const Manager = require('./Manager.js');
const rreaddir = require('recursive-readdir');
const exec = require('child_process').exec;
const fs = require('fs');

/**
 * Cog Manager class
 * 
 * @class CogManager
 * @extends Hibiki#Manager
 */

class CogManager extends Manager {

    /**
     * Creates an instance of CogManager.
     * @param {Hibiki?} client Hibiki client
     * @param {Object} options Hibiki options
     * 
     * @memberof CogManager
     */
    constructor(client, options) {
        super(client, options);
        this.cogDir = options.cogDir;
        this.aliases = {};
        this.cogs = {};
        this.__base = options.__base;
    }

    /**
     * Get the command from a cog
     * 
     * @param {String} name Name of the cog
     * @returns 
     * 
     * @memberof CogManager
     */

    getCommand(name) {
        if (this.aliases.hasOwnProperty(name) && this.cogs.hasOwnProperty(this.aliases[name]) && this.cogs[this.aliases[name]].hasOwnProperty('command')) return this.cogs[this.aliases[name]].command;
        if (this.cogs.hasOwnProperty(name) && this.cogs[name].hasOwnProperty('command')) return this.cogs[name].command;
        return null;
    }

    /**
     * Get all scripts from a cog
     * 
     * @param {String} name 
     * @returns {Object<Script>|null}
     * 
     * @memberof CogManager
     */

    getScripts(name) {
        if (this.aliases.hasOwnProperty(name) && this.cogs.hasOwnProperty(this.aliases[name]) && this.cogs[this.aliases[name]].hasOwnProperty('scripts')) return this.cogs[this.aliases[name]].scripts;
        if (this.cogs.hasOwnProperty(name) && this.cogs[name].hasOwnProperty('scrips')) return this.cogs[name].command.scripts;
        return null;
    }

    /**
     * Get a cog
     * 
     * @param {String} name Cog name
     * @returns {Object|null}
     * 
     * @memberof CogManager
     */

    get(name) {
        if (!this.cogs.hasOwnProperty(name) && !this.aliases.hasOwnProperty(name)) return null;
        if (this.aliases.hasOwnProperty(name) && this.cogs.hasOwnProperty(this.aliases[name])) return this.cogs[this.aliases[name]];
        return this.cogs[name];
    }

    /**
     * Check if a cog exists
     * 
     * @param {String} name Name of the cog
     * @returns {Boolean}
     * 
     * @memberof CogManager
     */

    has(name) {
        if (!this.cogs.hasOwnProperty(name) && !this.aliases.hasOwnProperty(name)) return false;
        return true;
    }

    /**
     * Check if a specific command exists
     * 
     * @param {String} name Command name
     * @returns {Boolean}
     * 
     * @memberof CogManager
     */

    hasCommand(name) {
        if (this.aliases.hasOwnProperty(name) && this.cogs.hasOwnProperty(this.aliases[name]) && this.cogs[this.aliases[name]].hasOwnProperty('command')) return true;
        if (this.cogs.hasOwnProperty(name) && this.cogs[name].hasOwnProperty('command')) return true;
        return false;
    }

    /**
     * Get all cogs with a command
     * 
     * @readonly
     * 
     * @memberof CogManager
     */

    get commandCogs() {
        const cmds = {};
        for (const cog of Object.keys(this.cogs)) if (this.cogs[cog].hasOwnProperty('command')) cmds[cog] = this.cogs[cog];
        return cmds;
    }
    
    /**
     * Get all cogs with scripts
     * 
     * @readonly
     * 
     * @memberof CogManager
     */

    get scriptCogs() {
        const scripts = {};
        for (const cog of Object.keys(this.cogs)) if (this.cogs[cog].hasOwnProperty('scripts') && Object.keys(this.cogs[cog].scripts).length > 0) scripts[cog] = this.cogs[cog];
        return scripts;
    }

    /**
     * Get all commands from the loaded cogs
     * 
     * @readonly
     * 
     * @memberof CogManager
     */

    get commands() {
        const cmds = {};
        for (const cog of Object.keys(this.cogs)) if (this.cogs[cog].hasOwnProperty('command')) cmds[this.cogs[cog].name] = this.cogs[cog].command;
        return cmds;
    }

    /**
     * Get all scripts from the loaded cogs
     * 
     * @readonly
     * 
     * @memberof CogManager
     */

    get scripts() {
        const scripts = {};
        for (const cog of Object.keys(this.cogs)) {
            if (this.cogs[cog].hasOwnProperty('scripts') && Object.keys(this.cogs[cog].scripts).length > 0) {
                for (const script of Object.keys(this.cogs[cog].scripts)) scripts[script] = this.cogs[cog].scripts[script];
            }
        }
        return scripts;
    }

    /**
     * Load all cogs
     * 
     * 
     * @memberof CogManager
     */

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

                if (pkg.disabled) {
                    this.logger.warn(`${file}:`, 'package is disabled!');
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

                cog.pkg = pkg;
                cog.description = pkg.description;
                cog.name = pkg.displayName || pkg.name;
                cog.path = file.replace('package.json', '');
                cog.main = pkg.main || null;
                cog.scripts = pkg.scripts;
                cog.category = pkg.categories && pkg.categories[0] || pkg.category || 'unknown';
                cog.version = pkg.version || '0.0.1';
                cog.author = pkg.author && pkg.author.name || pkg.author || 'unknown';
                cog.contributors = pkg.contributors || [];
                cog.hidden = pkg.private || pkg.hidden || false;
                cog.scripts = {};

                const next = () => {
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
                            }

                            if (!cmd.run) this.logger.error(`${file.replace('package.json', pkg.main)}:`, 'Couldn\'t find a run function!'); // lol

                            if (cmd.aliases.length > 0) {
                                for (const alias of cmd.aliases) {
                                    if (!this.aliases.hasOwnProperty(alias)) {
                                        this.aliases[alias] = pkg.name;
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
                                }

                                if (!mod.init) this.logger.error(`${file.replace('package.json', pkg.scripts[script])}:`, 'Couldn\'t find an init function!'); // lol

                                cog.scripts[script] = mod;
                            }
                        }

                        this.cogs[pkg.name] = cog;
                        this.client.emit('cogLoaded', cog.name, cog);

                    } catch (e) {
                        this.logger.error(`${file}:`, 'Error while initializing cog:', e); // you did a bad :<
                    }
                }

                if (deps.length > 0) { // Here we're installing the dependencies (if there are any)
                    exec(`npm i ${deps.join(' ')}`, (e, stdout, stderr) => {
                        if (stderr) this.logger.debug(`${file}:`, 'Error while installing dependencies:\n', stderr); // Oh no! an error :<
                        let all = false;
                        for (const dep of deps) if (!fs.existsSync(`${process.cwd()}/node_modules/${dep.split("@")[0]}`)) all = false;
                        if (!all) {
                            this.logger.error(`${file}:`, 'Failed to install packages'); // We continue to the next cog if packages failed to install
                        } else {
                            this.logger.custom({ name: 'SUCCESS', bgColor: 'green', color: 'black' }, `${file}:`, 'Packages installed successfully'); // If there are no errors we can safely assume the deps installed successfully
                            this.logger.debug(stdout);
                            next();
                        }
                    });
                } else next();
            }
        });
    }

    /**
     * Unload a cog
     * 
     * @param {String} name Cog to unload
     * @returns {Promise<String>}
     * 
     * @memberof CogManager
     */

    unload(name) {
        return new Promise((resolve, reject) => {
            if (!this.cogs.hasOwnProperty(name)) return reject("Cog not found");
            const cog = this.cogs[name];
            try {
                delete require.cache[require.resolve(`${cog.path}/${cog.pkg.main}`)];
                delete this.cogs[name];
                this.client.emit('cogUnloaded', name, cog);
                resolve(`Unloaded ${name}`);
            } catch(e) {
                reject(`Error while unloading ${name}: ${e}`);
            }
        });
    }

    /**
     * Reload a cog
     * 
     * @param {String} name 
     * @returns {Promise<Object>}
     * 
     * @memberof CogManager
     */

    reload(name) {
        return new Promise((resolve, reject) => this.unload(name).catch(reject).then(() => this.load(name).catch(reject).then(resolve)));
    }

    /**
     * Load a cog
     * 
     * @param {String} name Cog to load
     * @returns {Promise<Object>}
     * 
     * @memberof CogManager
     */

    load(name) {
        return new Promise((resolve, reject) => {
            rreaddir(`${process.cwd()}/${this.cogDir}`, (err, files) => {
                if (err) return reject(`Error while trying to load cogs:`, err);
                for (const file of files) {
                    if (!file.endsWith('package.json')) continue;

                    let cog = {};
                    let pkg;
                    const errors = [];
                    const deps = [];
                    const _pkg = fs.readFileSync(file);

                    if (!_pkg) continue; // Don't care if the package is empty, just continue kthx

                    try { 
                        pkg = JSON.parse(_pkg); // Parse the raw text
                    } catch (e) {
                        // Again, we don't care, just continue
                        continue;
                    }

                    if (!pkg.name || !pkg.main && !pkg.scripts || !pkg.description || !pkg.author || !pkg.version || !pkg.dependencies) continue; // Read previous note

                    if (pkg.name !== name) continue; // I just wanted to load rule34! not all !!

                    if (this.cogs.hasOwnProperty(pkg.name)) { // Don't load it 2x
                        reject(`${file}: Duplicate cog!`);
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

                    cog.pkg = pkg;
                    cog.name = pkg.displayName || pkg.name;
                    cog.path = file.replace('package.json', '');
                    cog.main = pkg.main || null;
                    cog.scripts = pkg.scripts
                    cog.category = pkg.categories && pkg.categories[0] || pkg.category || 'Other';
                    cog.version = pkg.version || '0.0.1';
                    cog.author = pkg.author && pkg.author.name || pkg.author || 'unknown';
                    cog.contributors = pkg.contributors || [];
                    cog.hidden = pkg.private || pkg.hidden || false;
                    cog.scripts = {};

                    const next = () => {
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
                                    errors.push(`${file.replace('package.json', pkg.main)}: Error while constructing command: ${e}`); // dw if you did a bad, we'll just reject it.
                                }

                                if (!cmd.run) reject(`${file.replace('package.json', pkg.main)}: Couldn't find a run function!`); // lol

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
                                        errors.push(`${file.replace('package.json', pkg.scripts[script])}: Error while constructing script: ${e}`);
                                    }

                                    if (!mod.init) errors.push(`${file.replace('package.json', pkg.scripts[script])}: Couldn't find an init function!`); // lol

                                    cog.scripts[script] = mod;
                                }
                            }

                            this.cogs[pkg.name] = cog;
                            resolve({ errors: errors, cog: cog });

                            /**
                             * Fired when a cog is loaded
                             * 
                             * @event cogLoaded
                             * @memberof Hibiki
                             */

                            this.client.emit('cogLoaded', pkg.name, cog);

                        } catch (e) {
                            reject(`${file}: Error while initializing cog: ${e}`); // you did a bad :<
                        }
                    }

                    if (deps.length > 0) { // Here we're installing the dependencies (if there are any)
                        exec(`npm i ${deps.join(' ')}`, (e, stdout, stderr) => {
                            if (stderr) this.logger.debug(`${file}:`, 'Error while installing dependencies:\n', stderr); // Oh no! an error :<
                            let all = false;
                            for (const dep of deps) if (!fs.existsSync(`${process.cwd()}/node_modules/${dep.split("@")[0]}`)) all = false;
                            if (!all) {
                                this.logger.error(`${file}:`, 'Failed to install packages'); // We continue to the next cog if packages failed to install
                            } else {
                                this.logger.custom({ name: 'SUCCESS', bgColor: 'green', color: 'black' }, `${file}:`, 'Packages installed successfully'); // If there are no errors we can safely assume the deps installed successfully
                                this.logger.debug(stdout);
                                next();
                            }
                        });
                    } else next();
                }
            });
        });
    }
}

module.exports = CogManager;