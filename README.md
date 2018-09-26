# C2O2B: CAS to OAuth2 Bridge

A storage-less OAuth2 server that authentificates to a Jasig CAS server
(<https://www.apereo.org/projects/cas>).

## Why?

Because universities deserve better delegated authentication than Jasig!

We use this internally at [UVSQ](http://www.uvsq.fr/) for
authenticating our students to a
[JupyterHub](https://jupyterhub.readthedocs.io/en/stable/) server. See
[here](https://github.com/defeo/jupyterhub-docker/).

## Install

Clone, then `npm install`.

## Configure

Edit `config.js`.

If you do not set a secret key to secure tokens, a new random secret
will be generated at every restart.

## Run

Type

	npm start

An environment variable `PORT` can be passed to override the settings
in `config.js`.

## Run with Docker

If you use docker, you can run C2O2B in a container. Pull the official
image:

	docker pull defeo/cas2oauth2bridge

Create a `config.js` file with your custom settings and bind-mount it
in the container:

	docker run -d  -p 38080:38080 -v ./config.js:/home/node/config.js defeo/cas2oauth2bridge

and you are all set! Your OAuth2 server is now ready to accept
connections (on port `38080`).
