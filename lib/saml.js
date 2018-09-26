const SamlStrategy = require('passport-saml').Strategy;

function samlAuth(req, res, next) {
    const strat = new SamlStrategy({ callbackUrl: appURL + '/auth', ...saml },
    				   (user, next) => next(null, user));
    
    if (req.body)
    	req.body.SAMLResponse = Buffer.from(req.body.SAMLResponse).toString('base64');
    
    strat.redirect = (url) => res.redirect(url, next);
    strat.error = (err) => {
    	console.error(err);
    	next(Error(err));
    }
    strat.fail = () => next(restify.errors.UnauthorizedError());
    strat.success = (user) => {
    	console.log(user);
    	req.userdata = user;
    	next();
    }

    strat.authenticate(req, { samlFallback: 'login-request' });
}
