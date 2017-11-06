const config = require('./config');

// If key is all zeros, generate random key
if (config.crypto.key.every((x) => x === 0)) {
    console.warn('No secret key set, generating random key.\n');
    require('crypto').randomFillSync(config.crypto.key);
}

const Oauth2 = require('./lib/oauth2');
const oauth = new Oauth2({ ...config.oauth, crypto: config.crypto });

const server = require('./lib/server')
      .createServer({
	  appURL: config.appURL,
	  cas: config.cas,
	  oauth,
      });

server.listen(config.port, function() {
    console.log('Using configuration:\n');
    console.dir(config, { depth: null });
    console.log('\n%s listening at %s', server.name, server.url);
});
