/* random_cat.js - spews out a random cat
 * 
 *  Contributors:
 * - Capuccino(@sr229) from Clara(@awau)
 * 
 */

const got = require('got');

/** 
 * this does nothing tbh nya
 * @returns {Promise} because I can.
 */
class RandomCat extends Command {
    constructor(client) {
        super(client);
        this.aliases = [
            "cat",
            "nya",
            "nyaa"
        ]
    }

    run(ctx) {
        return new Promise((resolve, reject) => {
            got('http://random.cat/meow').then(res => {
                let kitty= JSON.parse(res.body);
                return ctx.createMessage(kitty.file);
            }).catch(reject);
        });
    }
}

module.exports = RandomCat;