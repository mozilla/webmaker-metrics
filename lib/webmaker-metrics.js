var async = require('async');
var moment = require('moment');
var getenv = require('getenv');
var db = require('../lib/models');
var integrationDb = require('../lib/integration-data');


var DATE_RANGES_IN_DAYS = getenv.array('DATE_RANGES_IN_DAYS', 'int') || [14,30,90,360];


// crunch rid for days
// get,
// total users
// new users
// existing users
// event host
// event support
// mv badge
// mentor
// super mentor
// makes
// // save this row

// crunch for date range (days)
// get list of rids in this date range
// for each rid, crunch rid for days


function crunchForDays (crunchDate, periodLengthDays, callback) {
  'use strict';
  var usersNew = 100;
  var usersRepeat = 200;

  db.Aggregate.create({
    dateCrunched: crunchDate,
    periodEndDate: crunchDate, // <<<<< TODO
    periodLengthDays: periodLengthDays,
    referralCode: 'abcdef',
    usersNew: usersNew,
    usersRepeat: usersRepeat,
    learnersNew: 4,
    learnersRepeat: 5,
    mvcBadgeNew: 6,
    mvcBadgeRepeat: 7,
    eventHostNew: 8,
    eventHostRepeat: 9,
    eventSupportNew: 10,
    eventSupportRepeat: 11,
    mentorsNew: 12,
    mentorsRepeat: 13,
    superMentorsNew: 14,
    superMentorsRepeat: 15,
  }).error(function (err) {
    // Error
    console.error(err);
    return callback(err);
  }).success(function() {
    // Success
    console.log('Saved');
    return callback(null);
  });
}


/**
 * Initiates a number crunching excercise for a given date
 * @param  {date}   periodEndDate
 * @param  {Function} callback
 * @return {string} error
 */
function runCrunch (periodEndDate, callback) {
  'use strict';
  console.log(periodEndDate);
  // for each DATE_RANGES_IN_DAYS
  // crunch for a date range
  var periodLengthDays = 7;
  crunchForDays(periodEndDate, periodLengthDays, function (err) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null);
  });
}


/**
 * Checks the database to see if the number crunching has already run today
 * to avoid running the process more than necessary
 * @param  {Function} callback
 * @return {Boolean}
 */
function hasCrunchRunToday (callback) {
  'use strict';
  callback(null, false);
}

/**
 * The main function for this module. Checks if the crunch has been run today
 * and if not, starts the crunch process
 * @param  {Function} callback
 * @return {err, String}
 */
function checkAndCrunch (callback) {
  'use strict';
  hasCrunchRunToday(function (err, hasRun) {
    if (err) {
      return callback(err);
    }

    if (hasRun) {
      return callback(null, 'Crunch has already run today.');
    }

    var today = moment().format('YYYY-MM-DD');
    // TODO this will need to run for YESTERDAY (as the integration DB is updated daily)
    runCrunch(today, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Crunch run complete');
    });
  });
}


function updateEngagementMetrics (callback) {
  'use strict';
  var testDates = ['2014-07-15', '2014-07-16', '2014-07-17'];

  async.eachLimit(testDates, 3, function(date, callback) {

    // for each date range, get the metrics we care about
    async.parallel({
      usersActive: function(callback){

        // look at active users
        integrationDb.countActiveUsersInDateRange(date, date, null, function (err, res) {
          if (err) {
            console.error(err);
            return callback(err);
          }
          callback(null, res);
        });

      },
      usersMaking: function(callback){
        callback(null, 2);
      }
    },
    function(err, results) {
      if (err) {
        console.error(err);
        return callback(err);
      }
      // results is now equals to: {usersActive: 1, usersMaking: 2}
      console.log(date);
      console.log(results);
      // TODO Save this
    });




  }, function(err) {
    if(err) {
      console.error(err);
      return callback(err);
    }

    console.log('All Engagement Metrics have been crunched successfully');
    callback(null);
  });

}


module.exports = {
  checkAndCrunch: checkAndCrunch,
  updateEngagementMetrics: updateEngagementMetrics
};
