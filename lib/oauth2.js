const crypto = require('crypto');
const qs = require('querystring');

module.exports = class {
    constructor({ tokenLifetime, clients, algorithm, secret }) {
	this.clients = clients;
	this.algorithm = algorithm;
	this.secret = secret;
	this.lifetime = tokenLifetime;
    }

    encrypt(data) {
	const cipher = crypto.createCipher(this.algorithm, this.secret);
	let enc = cipher.update(JSON.stringify(data), 'utf8', 'base64')
	    + cipher.final('base64');
	return enc;
    }
    
    decrypt(ciph) {
	const cipher = crypto.createDecipher(this.algorithm, this.secret);
	let clear;
	try {
	    clear = cipher.update(ciph, 'base64', 'utf8')
		+ cipher.final('utf8');
	} catch (e) {
	    return null;
	}
	return JSON.parse(clear);
    }

    generateToken(data) {
	data.lifetime =
	      data.client && data.client.tokenLifetime
	      || this.lifetime;
	data.expiresAt = Date.now() + data.lifetime * 1000;
	return this.encrypt(data);
    }

    authorizationCode(query, user) {
	if (query.response_type !== 'code')
	    throw new Error(`Invalid OAuth request`);

	const client = this.getClient({
	    id: query.client_id,
	    uri: query.redirect_uri,
	    scope: query.scope,
	});
	if (!client)
	    throw new Error(`Forbidden client`);
	    
	const code = this.generateToken({
	    type: 'code',
	    client,
	    redirect_uri: query.redirect_uri,
	    scope: query.scope,
	    state: query.state,
	    user,
	});
	const q = qs.stringify({ code, state: query.state });
	return { code, url: `${query.redirect_uri}?${q}` };
    }
    
    exchangeToken(body) {
	if (body.grant_type !== 'authorization_code' || !body.code)
	    throw new Error(`Malformed request: ${JSON.stringify(body)}`);
	const client = this.getClient({
	    id: body.client_id || null,
	    secret: body.client_secret || null,
	    uri: body.redirect_uri,
	});
	if (!client)
	    throw new Error('Unauthorized client: ${JSON.stringify(body)}');
	
	const data = this.decrypt(body.code);
	if (data === null
	    || data.type !== 'code'
	    || data.expiresAt < Date.now()
	    || data.client.id != body.client_id
	    || data.redirect_uri !== body.redirect_uri)
	    throw new Error(`Bad token: ${JSON.stringify(data)}`);

	const tokenData = {
	    type: 'access_token',
	    client,
	    redirect_uri: data.redirect_uri,
	    scope: data.scope,
	    user: data.user,
	};
	const token = this.generateToken(tokenData);

	return { token, expires: tokenData.lifetime, user:data.user };
    }
    
    readToken(token, scope) {
	const data =  this.decrypt(token);
	
	if (data === null
	    || data.type !== 'access_token'
	    || data.expiresAt < Date.now())
	    throw new Error(`Bad token: ${JSON.stringify(data)}`);
	
	return data.user;
    }

    getClient({ id, secret, uri, scope }) {
	const c = this.clients[id];
	if (!c
	    || secret !== undefined && c.secret !== secret
	    || scope && c.scope !== scope
	    || uri && (c.redirectUri instanceof RegExp) && !c.redirectUri.test(uri)
	    || uri && !(c.redirectUri instanceof RegExp) && c.redirectUri !== uri)
	    return null;
	return {
	    id,
	    tokenLifetime: c.tokenLifetime || this.lifetime,
	}
    }
}
