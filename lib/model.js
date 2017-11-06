const crypto = require('crypto');

module.exports = class {
    constructor({ tokenLifetime, clients, algorithm, secret }) {
	this.clients = clients;
	this.algorithm = algorithm;
	this.secret = secret;
	this.lifetime = tokenLifetime;
    }

    encrypt(data) {
	const cipher = crypto.createCipher(this.algorithm, this.secret);
	let enc = cipher.update(JSON.stringify(data), 'utf8', 'base64');
	enc += cipher.final('base64');
	return enc;
    }
    
    decrypt(ciph) {
	const cipher = crypto.createDecipher(this.algorithm, this.secret);
	try {
	    let clear = cipher.update(ciph, 'base64', 'utf8');
	    clear += cipher.final('utf8');
	} catch (e) {
	    return null;
	}
	return JSON.parse(clear);
    }

    generateToken(data) {
	const lifetime =
	      data.client && data.client.accessTokenLifetime
	      || this.lifetime;
	return this.encrypt({
	    expiresAt: Date.now() + lifetime * 1000,
	    ...data,
	});
    }
    
    // authorize()
    generateAuthorizationCode(client, user, scope) {
	return this.generateToken({ type: 'code', client, user, scope });
    }
    
    saveAuthorizationCode(code, client, user) {
	console.log('Saving AC', code, client, user);
	return { client, user, ...code };
    }
    
    getAuthorizationCode(code) {
	const data = this.decrypt(code);
	if (data === null || data.type !== 'code')
	    return null;
	console.log('Retrieving AC', code, data)
	return { code, ...data };
    }
    
    // token()
    generateAccessToken(client, user, scope) {
	return this.generateToken({ type: 'access', client, user, scope });
    }
    
    saveToken(token, client, user) {
	console.log('Saving T', token, client, user);
	return { client, user, ...token } ;
    }

    getAccessToken(token) {
	const data = this.decrypt(code);
	if (data === null || data.type !== 'access')
	    return null;
	return { token, ...data };
    }

    // misc
    getClient(clientId, clientSecret) {
	const c = this.clients[clientId];
	if (!c || c.secret && clientSecret && c.secret != clientSecret)
	    return null;
	return {
	    id: clientId,
	    redirectUris: c.redirectUris,
	    grants: c.grants || [ 'authorization_code' ],
	    accessTokenLifetime: c.accessTokenLifetime || this.lifetime,
	    refreshTokenLifetime: c.refreshTokenLifetime || this.lifetime,
	}
    }

//    validateScope(user, client, scope) { }
//    verifyScope(accessToken, scope) { }
}
