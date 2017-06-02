const Manager = require('./Manager.js');
const fs = require('fs');

class LocaleManager extends Manager {
    constructor(client, options) {
        if (!options) throw new Error("No options specified for the locale manager");
        super(client, options);
        this.localeDir = options.localeDir;
        this.locales = {};
    }

    loadAll() {
        if (!fs.existsSync(`${process.cwd()}/${this.localeDir}/`)) return this.logger.error(`Locale directory was not found (${process.cwd()}/${this.localeDir}/)`);
        for (const file of fs.readdirSync(`${process.cwd()}/${this.localeDir}/`)) {
            if (!file.endsWith('.json')) continue;

            if (this.locales.hasOwnProperty(file.replace('.json', ''))) {
                this.logger.warn(`Duplicate locale: ${file.replace('.json', '')}`);
                continue;
            }

            try {
                this.locales[file.replace('.json', '')] = require(`${process.cwd()}/${this.localeDir}/${file}`);
                this.client.emit('localeLoaded', file.replace('.json', ''))
            } catch(e) {
                this.logger.error(`${file}: ${e}`);
            }

        }
    }

    l(m, a, o) {
        if (!m) throw new Error("Language not specified");
        if (!a) throw new Error("String not specified");

        let str = a[1] ? this.locales[m][a[0]][a[1]] : this.locales[m][a[0]];

        o = o || {};

        const keys = {
            time: o.time || o.date,
            error: o.err || o.error,
            number: o.num || o.number,
            string: o.str || o.string,
            text: o.txt || o.text || o.str || o.string,
            channel: o.channel,
            user: o.user || o.username,
            username: o.username || o.username,
            permission: o.perm || o.permission,
            url: o.url || o.uri,
            usage: o.usage || o.use,
            volume: o.vol || o.volume,
            choice: o.choice,
            votes: o.votes,
            total_votes: o.total_votes,
            setting: o.setting,
            language: o.lang || o.language || o.locale,
            custom_prefix: o.custom_prefix || o.cprefix || o.guild_prefix || o.prefix,
            flag: o.flag,
            argument: o.arg || o.argument,
            prefix: o.prefix || o.default_prefix || o.custom_prefix || o.guild_prefix || o.cprefix,
            translations: o.locales || o.translations || o.languages || Object.keys(this.locales).join('\n')
        }

        for (const key of Object.keys(keys)) str = str.replace(new RegExp(`{{${key}}}`), keys[key]);

        return str;

    }

}

module.exports = LocaleManager;