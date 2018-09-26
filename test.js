const restify = require('restify');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

const host = process.argv[2] || 'http://localhost:8080';

const strat = new OAuth2Strategy({
    authorizationURL: host + '/login',
    tokenURL: host + '/token',
    clientID: '0',
    clientSecret: 'test',
    callbackURL: 'http://localhost:8081/cb',
}, (accessToken, refreshToken, profile, done) => {
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
    console.log('OAuth2 server at', host);
});
