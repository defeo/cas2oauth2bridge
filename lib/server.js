const restify = require('restify');
const errors = require('restify-errors');
const request = require('request-promise-native');

const CASre = new RegExp(`<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>\\s*`
			 +   `<cas:authentication(Success|Failure)(?:\\s+code='(\\w+)')?>\\s*`
			 +       `(?:<cas:user>(.*)</cas:user>|(.*))\\s*`
			 +   `</cas:authentication\\1>\\s*`
			 + `</cas:serviceResponse>`);

exports.createServer = function({
    appURL,
    cas,
    oauth,
} = {}) {
    const server = restify.createServer({
	maxParamLength: 1000,
    });

    server.use(restify.plugins.queryParser({ mapParams: false }));
    server.use(restify.plugins.bodyParser({ mapParams: false }));
    
    /* 
       Login endpoint

       From: User Agent

       In: OAuth material

       Out: Redirect

       Redirects to CAS server for authentication, setting service
       URI to Authorization endpoint.
    */
    server.get({ path: '/login', version: '1.0.0' }, (req, res, next) => {
	const oauth = Buffer.from(JSON.stringify(req.query)).toString('base64');
	res.redirect(`${cas.entryPoint}?service=${appURL}/auth/${oauth}`, next);
    });

    /*
      Authorization endpoint
      
      From: User Agent

      In: OAuth material, CAS ticket

      Out: Authorization code

      Verifies CAS ticket with CAS server, sends back OAuth
      Authorization code.
    */
    server.get({ path: '/auth/:oauth', version: '1.0.0' }, (req, res, next) => {
	// Validate CAS ticket
	request({
	    uri: cas.validate,
	    qs: { service: `${appURL}/auth/${req.params.oauth}`,
		  ticket: req.query.ticket }
	}).then((body) => {
	    const m = CASre.exec(body);
	    if (m === null)
		throw new Error(`Cannot parse CAS response: ${body}"`);
	    
	    const success = m[1] == 'Success',
		  user = success ? m[3] : null,
		  code = success ? null : m[2],
		  reason = success ? null: m[4];

	    if (!success)
		throw new Error(`Cannot authenticate CAS user. Reason: ${reason}`);
	    
	    return user;
	}).then((user) => {
	    // Form OAuth2 response
	    const qs = JSON.parse(Buffer.from(req.params.oauth, 'base64').toString('ascii'));
	    auth = oauth.authorizationCode(qs, user);
	    res.redirect(auth.url, next);
	}).catch((err) => {
	    console.error('Error while authenticating:', err);
	    next(new errors.ForbiddenError());
	});
    });

    /*
      Token endpoint

      From: Client

      In: Authorization code, Client ID, Client secret

      Out: Access token, User ID

      Verifies Authorization token, generates access token
    */
    server.post({ path: '/token', version: '1.0.0' }, (req, res, next) => {
	const data = req.body;
	const m = /^Basic (.*)$/.exec(req.header('Authorization'));
	if (m)
	    [ data.client_id, data.client_secret ] =
		Buffer.from(m[1], 'base64').toString('utf8').split(':');
	
	let auth;
	try {
	    auth = oauth.exchangeToken(data);
	} catch (e) {
	    console.error(e);
	    next(new errors.UnauthorizedError());
	    return;
	}
	res.send({
	    token_type: 'Bearer',
	    access_token: auth.token,
	    expires_in: auth.expires,
	    user: auth.user,
	});
	next();
    });

    /*
      User data endpoint

      From: Client

      In: Access token

      Out: User ID, User data

      Verfies Access token, sends back user data
    */
    server.get({ path: '/userdata', version: '1.0.0' }, (req, res, next) => {
	const m = /^Bearer (.*)$/.exec(req.header('Authorization'));
	try {
	    res.send({
		username: oauth.readToken(m[1]),
	    });
	    next();
	} catch (e) {
	    next(new errors.UnauthorizedError());
	}
    });
    
    return server;
}
