const config = require('./config');
const Oauth2 = require('./lib/oauth2');

oauth = new Oauth2({ ...config.crypto, ...config.oauth });

const server = require('./lib/server')
      .createServer({
	  appURL: config.appURL,
	  cas: config.cas,
	  oauth,
      });

server.listen(config.port, function() {
    console.log('%s listening at %s', server.name, server.url);
});
