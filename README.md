# CAS to OAuth2 bridge

A storage-less OAuth2 server that authentificates to a CAS server
(<https://www.apereo.org/projects/cas>).

## Why?

Because delegated authentication sucks at [UVSQ](http://www.uvsq.fr/)!

## Install

Clone, then `npm install`.

## Configure

Edit `config.js`.

If you do not set a secret key to secure tokens, a new random secret
will be generated at every restart.

## Run

Type

	npm start

Environment variables `PORT` and `OAUTH_SECRET` can be passed to
override the settings in `config.js`.

If a `.env` file is present, it is also parsed for environment
variables.

## Run in Docker

A `Dockerfile` is provided to easily set up the server in a
container. Build an image with

	cd cas2oauth2bridge
	docker build -t c2o2b .

Then run the container with

	docker run -d -p 38080:38080 c2o2b

Finally, point your webserver to the bind port (`38080` in the
example).
