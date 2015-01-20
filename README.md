Webmaker Metrics
===================================================

## Introduction

Crunching some Webmaker numbers and reporting on them.

* Referral Dashboard for Engagement team to understand impact of marketing campaigns
* Webmaker KPI dashboard for product team to understand impact of changes to the product

## Structure

* `crunch.js` does the crunching of the raw data to produce the aggregates
* `app.js` provides front-end routes to the aggregate data

## Data

This app stores aggregate snapshots of data in a local database. The structure for this local data is automatically generated by sequelize. The models for this data are found in `lib/models.js`. This data is used for the front-end reporting.

This app also analyzes data from a seperate `mofointegration` database. This database contains a nightly snapshot of the Webmaker databases from across the multiple webmaker apps and sites. This app has readonly access to a selection of Views on the mofointegration DB which expose the necessary data but not PII (email addresses are obfuscated). Modifying these views requires admin rights to the mofointegration database.

## About Webmaker Retention Metrics

Webmaker stores an account creation date, and a last updated date. A user who is innactive one day, may then be `retained` the following day if they log back in. This means regularly daily snapshots of retention rate will report differently from a backdated analysis of the data, where periods of inactivity are hidden by the most recent activity.

For daily tracking of 7 day retention rate, we are reporting on the % of users who joined 7-14 days prior to the snapshot date who were active (updatedAt) more than 7 days after their account creation. The same applies to 30 day retention, but we look at the users who signed up 30-37 days prior to the snapshot date. This model is consistent assuming daily snapshots.

## Development
```
$ foreman run node crunch
$ foreman run nodemon app
```

## Notes

```
$ heroku config:set NODE_ENV=production
```

## Utils
* `/util/crunch7daysProduct`

## Google Analytics Auth

* Visit this path `https://localhost:8888/ga/auth` (or the production equivilent)
* Login using the LOCAL_AUTH_USERNAME and LOCAL_AUTH_PASSWORD set in the env
* Authenticate with a Google Account that has access to the Webmaker GA profile
* This app will store a token so it can continue to talk to GA using your GA account after you finish your session

### GA API settings

* Configured here: https://code.google.com/apis/console
* App URLs have to be configured in the Google Developer Console. For local development, this is setup to work with `https://localhost:8888/ga/oauth2callback`, this will fall over if you use another port, or don't use HTTPS.

###
* The Google Analytics API explorer is useful for testing queries: https://ga-dev-tools.appspot.com/explorer/

## Localhost HTTPS

You will need to generate a self-signed certificate for local development over HTTPS. See http://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server

Save the key and the cert here:

```
/config/key.pem
/config/cert.pem
```
