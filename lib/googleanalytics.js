var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var analytics = google.analytics('v3');
var db = require('../lib/models');
var moment = require('moment');

var CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);


/**
 * AUTH & GENERAL WORKFLOW
 */

function getAuthURL(callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/analytics' // can be a space-delimited string or an array of scopes
  });

  callback(null, url);
}

function updateAuthTokens(code, callback) {
  oauth2Client.getToken(code, function(err, tokens) {
    if(err) {
      console.error(err);
      return callback(err);
    }

    // set tokens to the client
    oauth2Client.setCredentials(tokens);

    if (!tokens.refresh_token) {
      return callback();
    }
    // save the refresh toke to the DB
    db.PersistKey.findOrCreate({ where: {key: 'gaRefreshToken'}})
      .success(function(persistKey, created) {
        persistKey.value = tokens.refresh_token;
        persistKey.save()
          .success(function (persistKey) {
            console.log('saved auth token key');
            return callback();
          });
    });
  });
}

function refreshCredentialsIfRequired(callback) {

  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    // try and auth
    db.PersistKey.find({ where: {key: 'gaRefreshToken'} }).success(function(persistKey) {
      var tokens = {
        access_token: 'none',
        refresh_token: persistKey.dataValues.value
      };
      oauth2Client.setCredentials(tokens);
      oauth2Client.refreshAccessToken(function (err, res) {
        if (err) {
          console.log(err);
          return callback(err);
        }
        // refreshed so now we can run the query
        return callback();
      });
    });

  } else {
    // token is fine, so run the query
    return callback();
  }

}

/**
 * QUERIES
 */

/**
 * Get UVs for a given day
 */
function getUVs (args, viewId, callback) {
  if (!args.snapshotDate) {
    return callback('args.snapshotDate is required');
  }
  var snapshotDate = args.snapshotDate;

  refreshCredentialsIfRequired(function finishedRefresh (err) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    // credentials are up to date, so run the query
    analytics.data.ga.get( {
      auth: oauth2Client,
      "ids": viewId,
      "start-date": snapshotDate,
      "end-date": snapshotDate,
      "metrics": "ga:users"
    },
    function (err, response) {
      if (err) {
        console.log('An error occured', err);
        return callback(err);
      }
      var users = response.totalsForAllResults['ga:users'];
      callback(null, users);
    });
  });
}

/**
 * Get Web UVs for a given day
 */
function productUVsWeb (args, callback) {

  getUVs(args, process.env.GA_VIEW_ID, function (err, users) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, users);
  });
}

/**
 * Get App UVs for a given day
 */
function productUVsApp (args, callback) {

  getUVs(args, process.env.GA_VIEW_ID_APP, function (err, users) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, users);
  });
}


/**
 * Get UVs per country, last 30 days
 */
function uvsByCountry30Days (args, callback) {
  if (!args.snapshotDate) {
    return callback('args.snapshotDate is required');
  }
  var endDate = args.snapshotDate;
  var startDate = moment(endDate).subtract(30, 'days').format('YYYY-MM-DD');

  refreshCredentialsIfRequired(function finishedRefresh (err) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    // credentials are up to date, so run the query
    analytics.data.ga.get( {
      auth: oauth2Client,
      "ids": process.env.GA_VIEW_ID,
      "start-date": startDate,
      "end-date": endDate,
      "metrics": "ga:users",
      "dimensions": "ga:country",
      "max-results": 250,
      "filters": "ga:users>500"
    },
    function (err, response) {
      if (err) {
        console.log('An error occured', err);
        return callback(err);
      }
      callback(null, response);
    });
  });
}

module.exports = {
  getAuthURL:getAuthURL,
  updateAuthTokens:updateAuthTokens,
  productUVsWeb:productUVsWeb,
  productUVsApp:productUVsApp,
  uvsByCountry30Days: uvsByCountry30Days
};
