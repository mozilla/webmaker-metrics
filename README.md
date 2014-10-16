Webmaker Metrics
===================================================

## Introduction

Crunching some numbers and reporting on them.

## Structure

* `crunch.js` does the crunching of the raw data to produce the aggregates
* `app.js` provides front-end routes to the aggregate data

## Development
```
$ foreman run node crunch
$ foreman run nodemon web
```

## Notes

```
$ heroku config:set NODE_ENV=production
```

## Localhost HTTPS

You will need to generate a self-signed certificate for local development over HTTPS. See http://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server

Save the key and the cert here:

```
/config/key.pem
/config/cert.pem
```
