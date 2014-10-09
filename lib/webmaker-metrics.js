var async = require('async');
var moment = require('moment');
var getenv = require('getenv');
var db = require('../lib/models');
var integrationDb = require('../lib/integration-data');
var util = require('../lib/util');


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




/**
 * Queries various views to get the stats we care about for the date ranges
 * we care about
 * @param  {Function} callback
 */
function runEngagementMetricsQueries (callback) {
  'use strict';

  var dateRanges = util.engagementMetricsDateRanges();

  async.eachLimit(dateRanges, 2, function(dateRange, callback) {

    var startDateInclusive = dateRange[0];
    var endDateInclusive = dateRange[1];

    // for each date range, get the metrics we care about
    async.parallel({

      // COUNT USERS ACTIVE
      usersActive: function(callback){
        integrationDb.countUsersActive(startDateInclusive, endDateInclusive, null, function (err, res) {
          if (err) {
            console.error(err);
            return callback(err);
          }
          callback(null, res);
        });

      },

      // COUNT USERS MAKING
      usersMaking: function(callback){
        integrationDb.countUsersMaking(startDateInclusive, endDateInclusive, null, function (err, res) {
          if (err) {
            console.error(err);
            return callback(err);
          }
          callback(null, res);
        });
      },

      // COUNT USERS TEACHING
      usersTeaching: function(callback){
        integrationDb.countUsersTeaching(startDateInclusive, endDateInclusive, null, function (err, res) {
          if (err) {
            console.error(err);
            return callback(err);
          }
          callback(null, res);
        });
      }


    },
    function(err, results) {
      // async.parallel() has finished or exited because of an error
      if (err) {
        console.error(err);
        return callback(err);
      }

      // Save this
      db.EnagementMetric.create({
          dateCrunched: moment().format('YYYY-MM-DD'),
          startDateInclusive: startDateInclusive,
          endDateInclusive: endDateInclusive,
          visits: 0,
          visitsNonBouncing: 0,
          usersActive: results.usersActive,
          usersMaking: results.usersMaking,
          usersTeaching: results.usersTeaching,
        }

      ).error(function (err) {
        // Error
        console.error(err);
        return callback(err);

      }).success(function() {
        // Success
        console.log('Saved');
        return callback(null);
      });

    });

  }, function(err) {
    // async.each() has finished or exited because of an error
    if(err) {
      console.error(err);
      return callback(err);
    }

    console.log('All Engagement Metrics have been crunched successfully');
    callback(null);
  });
}


/**
 * Clear out the table and run the queries again up to today
 * @param  {Function} callback
 */
function updateEngagementMetrics (callback) {
  'use strict';

  // clear the old data
  db.EnagementMetric.destroy({}, {truncate:true}
    ).success(function (affectedRows) {
      // cleared
      console.info('Cleared EngagementMetrics table, deleting', affectedRows, ' rows');
      // get the latest data
      runEngagementMetricsQueries(function (err) {
        if (err) {
          console.error(err);
          return callback(err);
        }
        callback();
      });
    });
}


module.exports = {
  checkAndCrunch: checkAndCrunch,
  updateEngagementMetrics: updateEngagementMetrics
};
