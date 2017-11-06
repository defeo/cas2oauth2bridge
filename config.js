module.exports = {
    appURL: "https://keats.prism.uvsq.fr/oauth2",
    port: process.env.PORT || 8080,
    cas: {
	entryPoint: "https://cas.uvsq.fr/login",
	validate: "https://cas.uvsq.fr/serviceValidate",
    },
    saml: {
	entryPoint: "https://cas.uvsq.fr/login",
	issuer: "cas2oauth2bridge",
    },
    crypto: {
	algorithm: "aes-256-gcm",
	key: new Buffer(process.env.OAUTH_SECRET ||     // Change me!
			''.padEnd(64, '0'),
			'hex'),
	ivlen: 16,
    },
    oauth: {
	tokenLifetime: 24*60*60,
	clients: {
	    "0": {
		secret: "test",
		redirectUri: "http://localhost:8081/cb",
	    },
	    "1": {
		secret: null,
		redirectUri: new RegExp('^https://.*\\.uvsq\\.fr/'),
	    },
	},
    },
}
