Webmaker Metrics
===================================================

## Introduction

Crunching some numbers and reporting on them.

## Structure

* `lib/data.js` does the crunching of the raw data to produce the aggregates
* `app.js` provides public routes to the aggregate data

## Development

### Dependencies
* `npm install -g mocha`

### Commands
```
$ grunt workon
$ mocha
```

## Development
```
$ foreman run node crunch
```

## Deploy

```
$ grunt build
$ git push heroku master
```

## Notes

```
$ heroku config:set NODE_ENV=production
```
