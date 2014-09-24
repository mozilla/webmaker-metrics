var mysql = require('mysql');
var async = require('async');
var moment = require('moment');
var getenv = require('getenv');

var connectionOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

if (process.env.DB_SSL) {
  // SSL is used for Amazon RDS, but not necessarily for local dev
  connectionOptions.ssl = process.env.DB_SSL;
}

var DATE_RANGES_IN_DAYS = getenv.array('DATE_RANGES_IN_DAYS', 'int') || [14,30,90,360];



//

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

// crunchToday
// for each date range
// crunch for date rage

// Crunch
// check if today has been done
// if not, crunch


/**
 * Initiates a number crunching excercise for a given date
 * @param  {date}   date
 * @param  {Function} callback
 * @return {string} error
 */
function runCrunch (date, callback) {
  'use strict';
  console.log(date);
  callback(null);
}


/**
 * Checks the database to see if the number crunching has already run today
 * to avoid running the process more than necessary
 * @param  {Function} callback
 * @return {Boolean}
 */
function hasCrunchRunToday (callback) {
  'use strict';
  callback(null, true);
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
    runCrunch(today, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Crunch run complete');
    });
  });
}

module.exports = {
  checkAndCrunch: checkAndCrunch,
};
