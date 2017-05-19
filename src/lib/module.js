const Client = require(`${__dirname}/Hibiki.js`);

function Hibiki(token, options) {
    if (!token) throw new Error("No token given.");
    return new Client(token, options);
}

Hibiki.Client = Client;

module.exports = Hibiki;