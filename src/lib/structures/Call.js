const Eris = require('eris');

class Call extends Eris.Call {
    constructor(data, channel) {
        super(data, channel);
        this.data = data;
    }
}

module.exports = Call;