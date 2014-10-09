var mysql = require('mysql');
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


/**
 * Count new users who have created an account in this range
 * OR existing users who have logged in and/or updated something during
 * OR AFTER this time period
 * @param  {date}   startDateInclusive
 * @param  {date}   endDateInclusive
 * @param  {obj}   options
 * @param  {Function} callback
 */
function countUsersActive (startDateInclusive, endDateInclusive, options, callback) {
  'use strict';

  // ISO 8601 dates
  startDateInclusive  = moment(startDateInclusive).format('YYYY-MM-DD');
  endDateInclusive    = moment(endDateInclusive).format('YYYY-MM-DD');

  if (options) {
    // if (options.referralCode) {
    //   // filter on this
    // }
  }

  // connect
  var connection = mysql.createConnection(connectionOptions);
  connection.connect(function connectionAttempted(err) {
    if (err) {
      connection.end();
      console.error(err);
      return callback(err);
    }

      // query
      /*jshint multistr: true */
      var query = 'SELECT COUNT(*) as usersActive FROM mofointegration.vw_wm_metrics_users \
                    WHERE DATE(createdAt) <= ? \
                    AND ((DATE(updatedAt) >= ?) OR (DATE(lastLoggedIn) >= ?) OR (DATE(createdAt) >= ?));';
      var values = [endDateInclusive, startDateInclusive, startDateInclusive, startDateInclusive];

      connection.query(query, values, function (err, result) {
        connection.end();
        if (err) {
          console.error(err);
          return callback(err);
        }
        var usersActive = result[0].usersActive;
        return callback(null, usersActive);
      });

  });
}


/**
 * Count number of users who have published a make in this date range
 * @param  {date}   startDateInclusive
 * @param  {date}   endDateInclusive
 * @param  {obj}   options
 * @param  {Function} callback
 */
function countUsersMaking (startDateInclusive, endDateInclusive, options, callback) {
  'use strict';

  // ISO 8601 dates
  startDateInclusive  = moment(startDateInclusive).format('YYYY-MM-DD');
  endDateInclusive    = moment(endDateInclusive).format('YYYY-MM-DD');

  if (options) {
    // if (options.referralCode) {
    //   // filter on this
    // }
  }

  // connect
  var connection = mysql.createConnection(connectionOptions);
  connection.connect(function connectionAttempted(err) {
    if (err) {
      connection.end();
      console.error(err);
      return callback(err);
    }

      // query
      /*jshint multistr: true */
      var query = 'SELECT COUNT(DISTINCT userIdHash) as usersMaking FROM mofointegration.vw_wm_metrics_makes \
                    WHERE (DATE(createdAt) BETWEEN ? AND ?) \
                    OR (DATE(updatedAt) BETWEEN ? AND ?);';
      var values = [startDateInclusive, endDateInclusive, startDateInclusive, endDateInclusive];

      connection.query(query, values, function (err, result) {
        connection.end();
        if (err) {
          console.error(err);
          return callback(err);
        }
        var usersMaking = result[0].usersMaking;
        return callback(null, usersMaking);
      });

  });
}


/**
 * Count number of users 'teaching': hosting, mentoring or coorganizing an event
 * @param  {date}   startDateInclusive
 * @param  {date}   endDateInclusive
 * @param  {obj}   options
 * @param  {Function} callback
 */
function countUsersTeaching (startDateInclusive, endDateInclusive, options, callback) {
  'use strict';

  // ISO 8601 dates
  startDateInclusive  = moment(startDateInclusive).format('YYYY-MM-DD');
  endDateInclusive    = moment(endDateInclusive).format('YYYY-MM-DD');

  if (options) {
    // if (options.referralCode) {
    //   // filter on this
    // }
  }

  // connect
  var connection = mysql.createConnection(connectionOptions);
  connection.connect(function connectionAttempted(err) {
    if (err) {
      connection.end();
      console.error(err);
      return callback(err);
    }

      // query
      /*jshint multistr: true */
      var query = 'SELECT COUNT(DISTINCT userIdHash) as usersTeaching FROM mofointegration.vw_wm_metrics_teaching \
                    WHERE (DATE(eventDate) BETWEEN ? AND ?);';
      var values = [startDateInclusive, endDateInclusive];

      connection.query(query, values, function (err, result) {
        connection.end();
        if (err) {
          console.error(err);
          return callback(err);
        }
        var usersTeaching = result[0].usersTeaching;
        return callback(null, usersTeaching);
      });

  });
}



module.exports = {
  countUsersActive: countUsersActive,
  countUsersMaking: countUsersMaking,
  countUsersTeaching: countUsersTeaching,
};
