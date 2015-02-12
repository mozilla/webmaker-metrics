var mysql = require('mysql');
var async = require('async');
var makeapi = new require('makeapi-client')({
  apiURL: 'https://makeapi.webmaker.org'
});
var moment = require('moment');

var connectionOptions = {
  host: process.env.INTEGRATION_DB_HOST,
  user: process.env.INTEGRATION_DB_USER,
  password: process.env.INTEGRATION_DB_PASSWORD,
  database: process.env.INTEGRATION_DB_NAME,
  port: process.env.INTEGRATION_DB_PORT
};

if (process.env.INTEGRATION_DB_SSL) {
  // SSL is used for Amazon RDS, but not necessarily for local dev
  connectionOptions.ssl = process.env.DB_SSL;
}


function saveMake (make, callback) {
  'use strict';

  // connect
  var connection = mysql.createConnection(connectionOptions);
  connection.connect(function connectionAttempted(err) {
    if (err) {
      connection.end();
      console.error(err);
      return callback(err);
    }

    // rn the query
    connection.query('INSERT INTO mofointegration.appmaker_temp SET ? ON DUPLICATE KEY UPDATE id=id', make, function(err, result) {
      connection.end();
      if (err) {
        console.error(err);
        return callback(err);
      }
      console.log('saved:', result);
      callback();
    });

  });
}

function refreshStats () {
  'use strict';

  console.log( '[%s] Scraping Appmaker Makes', Date());

  var PER_PAGE = 50;
  var page = 1;
  var done = false;

  function checkPage (pageNumber, callback) {

    makeapi
      // define the search
      .contentType( 'Appmaker' )
      .limit(PER_PAGE)
      .page(pageNumber)
      // then execute this search
      .then(function( err, makes ) {
        if( err ) {
          return callback(err);
        }

        // there are no further results
        if (makes.length === 0) {
          done = true;
          return callback(null);
        }

        // process each of the makes returned on this page
        async.eachLimit(makes, 10,

          function processEach (make, callback) {

            var makeToSave = {};
            makeToSave.username = make.author;
            makeToSave.createdAt = moment(make.createdAt).format('YYYY-MM-DD');
            makeToSave.updatedAt = moment(make.updatedAt).format('YYYY-MM-DD');
            makeToSave.id = make._id;

            saveMake(makeToSave, function (err) {
              if (err) {
                console.error(err);
                return callback(err);
              }
              callback();
            });
          },

          function processingPageDone (err) {
            if (err) {
              console.error('Error processing Makes on page:', page);
              return callback(err);
            }
            callback(null);
          });
      });
  }

  async.until(
    function () {
      return done;
    },

    function checkNextPage (callback) {
      checkPage(page, function (err) {
        if (err) {
          console.error(err);
        }

        page += 1;
        callback();
      });
    },

    function finishedCheckingPages (err) {
      if (err) {
        console.error(err);
      }

      console.log( '[%s] Finished Scraping Appmaker Makes', Date());
    }
  );
}

module.exports = {
  refreshStats: refreshStats
};

// Sample App Data
// {
//   "appTags":[],
//   "userTags":[],
//   "rawTags":[],
//   "url":"http://optimal-help-842.appalot.me/install",
//   "contentType":"Appmaker",
//   "locale":"en-US",
//   "title":"Dattu's Rocket launcher",
//   "description":"",
//   "author":"swapnilghan",
//   "published":true,
//   "tags":[],
//   "thumbnail":"http://appmaker.mozillalabs.com/images/mail-man.png",
//   "username":"swapnilghan",
//   "remixedFrom":null,
//   "_id":"53bee56fe1fe11a32100040d",
//   "emailHash":"113cd6c8cd9d8f64c2ba7cc5baa403b6",
//   "createdAt":1405019503829,
//   "updatedAt":1405019503829,
//   "likes":[],
//   "reports":[],
//   "remixurl":"https://apps.webmaker.org/designer?remix=http%253A%252F%252Foptimal-help-842.appalot.me%252Fapp",
//   "editurl":"https://apps.webmaker.org/designer?edit=Dattu's%20Rocket%20launcher","id":"53bee56fe1fe11a32100040d"
// }
