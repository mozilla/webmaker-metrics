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
function countActiveUsersInDateRange (startDateInclusive, endDateInclusive, options, callback) {
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
      var query = 'SELECT COUNT(*) FROM mofointegration.vw_wm_metrics_users \
                    WHERE createdAt <= ? \
                    AND ((updatedAt >= ?) OR (lastLoggedIn >= ?) OR (createdAt >= ?));';
      var values = [endDateInclusive, startDateInclusive, startDateInclusive, startDateInclusive];

      query = connection.query(query, values, function (err, result) {
        connection.end();
        if (err) {
          console.error(err);
          return callback(err);
        }
        return callback(null, result);
      });

      console.log(query);

  });
}



module.exports = {
  countActiveUsersInDateRange: countActiveUsersInDateRange,
};
