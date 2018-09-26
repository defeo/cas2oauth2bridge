/**
 * Example configuration for C2O2B.
 * 
 * Edit to your needs, put it in the root folder, or mount as a Docker
 * volume, e.g.:
 *
 *     docker run -d -v ./config.js:/home/node/config.js cas2oauth2bridge
 **/
module.exports = {
    // The URL where the OAuth2 server will respond
    appURL: "https://example.com/oauth2",
    // The port to bind to
    port: 8080,

    // The endpoints of the CAS server (v1.0) to authenticate to
    cas: {
	entryPoint: "https://cas.example.com/login",
	validate: "https://cas.example.com/serviceValidate",
    },
    // The endpoint of the SAML server (v2.0) to authenticate to
    saml: {
	entryPoint: "https://cas.example.com/login",
	issuer: "cas2oauth2bridge",
    },
    
    // The cipher used to encrypt cookies
    crypto: {
	// Authenticated encryption mode
	algorithm: "aes-256-gcm",
	// If initialized to zero, like here, a random key will be
	// generated at startup (hence, cookies will not survive
	// reboot).
	key: Buffer.alloc(32),
	ivlen: 16,
    },
    
    // Definition of the services
    oauth: {
	// Expiration time of authentication cookies
	tokenLifetime: 24*60*60,
	// The services allowed to authenticate to this server
	clients: {
	    // A local test service, with a client secret
	    // (see test.js)
	    "0": {
		secret: "test",
		redirectUri: "http://localhost:8081/cb",
	    },
	    // A catch-all for all services *.example.com, without client secret
	    "1": {
		secret: null,
		redirectUri: new RegExp('^https://.*\\.example\\.com/'),
	    },
	},
    },
}
