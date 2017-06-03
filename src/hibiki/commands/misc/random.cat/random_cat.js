/* random_cat.js - spews out a random cat
 * 
 *  Contributors:
 * - Capuccino(@sr229) from Clara(@awau)
 * 
 */

const {Command} = require('../../../../../');
const got = require('got');

/** 
 * this does nothing tbh nya
 * @returns {Promise} because I can.
 */
class RandomCat extends Command {
    constructor(client) {
        super(client);
    }

    run(ctx) {
        return new Promise((resolve, reject) => {
            got('http://random.cat/meow').then(res => {
                let kitty= JSON.parse(res.body);
                return ctx.createMessage(kitty);
            }).catch(reject);
        });
    }
}

module.exports = RandomCat;