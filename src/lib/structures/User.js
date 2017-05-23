const Eris = require('eris');

class User extends Eris.User {
    constructor(data, client) {
        super(data, client);
        this.data = data;
    }

    get language() {
        return this._client.db.cache.get(`user_${this.id}`).lang || 'en';
    }
}

module.exports = User;