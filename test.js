const restify = require('restify');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const strat = new OAuth2Strategy({
    authorizationURL: 'http://localhost:8080/login',
    tokenURL: 'http://localhost:8080/token',
    clientID: '0',
    clientSecret: 'test',
    callbackURL: 'http://localhost:8081/cb',
}, (accessToken, refreshToken, profile, done) => {
    console.log(accessToken, refreshToken, profile);
    done(null, profile);
});
passport.use('oauth2', strat);

const server = restify.createServer();

server.use(restify.plugins.queryParser({ mapParams: false }));
server.use(passport.initialize());
server.use(passport.authenticate('oauth2', { session: false }));

server.get('/', (req, res, next) => next());
server.get('/cb', (req, res, next) => {
    res.send(req.user);
    next()
});

server.listen(8081, function() {
    console.log('%s listening at %s', server.name, server.url);
});
