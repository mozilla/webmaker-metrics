var mysql = require('mysql');
var moment = require('moment');
var async = require('async');

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

var BADGE_NAMES_MVC = ['badge-webmaker-skill-sharer',
                    'badge-webmaker-skill-sharer-code-week-eu',
                    'badge-webmaker-teaching-kit-remixer'];
var BADGE_NAMES_SUPER_MENTOR = ['badge-webmaker-super-mentor'];
var BADGE_NAMES_MENTOR = ['badge-webmaker-mentor'];

/**
 * Count new users who have created an account in this range
 * OR existing users who have logged in during OR AFTER this time period
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
                    AND ((DATE(updatedAt) >= ?) OR (DATE(createdAt) >= ?));';
      var values = [endDateInclusive, startDateInclusive, startDateInclusive];

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
 * Local utility function
 * @param  {obj} args used in our aggreaget queries
 * @return {String} ISO formatted date
 */
function aggregateStartDate (args) {
  'use strict';
  // because we're using BETWEEN in SQL queries which are inclusive of the dates
  // we reduce the period by 1, so a requested period of 7 days, only shows 7
  // days worth of data in our results.
  var daysToCount = args.periodLengthDays - 1;
  return moment(args.periodEndDate).subtract(daysToCount, 'days').format('YYYY-MM-DD');
}

/**
 * Local utility function
 * @param  {obj} args used in our aggreaget queries
 * @return {String} ISO formatted date
 */
function aggregateEndDate (args) {
  'use strict';
  return moment(args.periodEndDate).format('YYYY-MM-DD');
}

/**
 * get the rids for a given date range
 * @param {obj}   args
 * @param {Function} callback
 */
function RIDsForDateRange (args, callback) {
  'use strict';

  var startDateInclusive  = aggregateStartDate(args);
  var endDateInclusive    = aggregateEndDate(args);

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
      var query = 'SELECT DISTINCT referrer FROM mofointegration.vw_wm_metrics_referrers \
                    WHERE DATE(ridCreatedAt) BETWEEN ? AND ?;';
      var values = [startDateInclusive, endDateInclusive];

      connection.query(query, values, function (err, result) {
        connection.end();
        if (err) {
          console.error(err);
          return callback(err);
        }
        var rids = [null];

        for (var i = 0; i < result.length; i++) {
          rids.push(result[i].referrer);
        }

        return callback(null, rids);
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
                    WHERE (DATE(createdAt) BETWEEN ? AND ?);';
      var values = [startDateInclusive, endDateInclusive];

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


/**
 * Runs an SQL query that returns the result of a COUNT() as 'aggregate'
 * @param  {String}   query
 * @param  {Arrya}   values
 * @param  {Function} callback
 */
function getAggregate (query, values, callback) {
  'use strict';

  // connect
  var connection = mysql.createConnection(connectionOptions);
  connection.connect(function connectionAttempted(err) {
    if (err) {
      connection.end();
      console.error(err);
      return callback(err);
    }

    // Run the query
    connection.query(query, values, function (err, result) {
      connection.end();
      if (err) {
        console.error(err);
        return callback(err);
      }
      var aggregate = result[0].aggregate;
      return callback(null, aggregate);
    });

  });
}


/**
 * query a given badge name or names and see how many were issued in a time frame
 * @param  {obj}   args
 * @param  {Array}   badgeNames
 * @param  {Function} callback
 */
function queryBadgesNew (args, badgeNames, callback) {
  'use strict';
  var startDateInclusive  = aggregateStartDate(args);
  var endDateInclusive    = aggregateEndDate(args);

  var query, values;
  // RID - We're looking at stats for a specific RID
  if (args.rid) {
    // People who engaged with a RID and then earned a badge
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userId) as aggregate FROM mofointegration.vw_wm_metrics_referrers_and_badges \
                WHERE referrer = ? \
                AND (DATE(badgedOn) BETWEEN ? AND ?) \
                AND (DATE(badgedOn) >= ridCreatedAt) \
                AND badgeName IN (?);';
    values = [args.rid, startDateInclusive, endDateInclusive, badgeNames];

  } else {
    // TOTAL - No RID supplied, so look at the total webmaker numbers instead
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userId) as aggregate FROM mofointegration.vw_wm_metrics_badges \
                WHERE (DATE(badgedOn) BETWEEN ? AND ?) \
                AND badgeName IN (?);';
    values = [startDateInclusive, endDateInclusive, badgeNames];
  }

  getAggregate(query, values, function (err, res) {
    if (err) {
      console.error(err);
      callback(err);
    }
    callback(null, res);
  });
}

/**
 * query a given badge name or names and see how many were issued in a time frame
 * @param  {obj}   args
 * @param  {Array}   badgeNames
 * @param  {Function} callback
 */
function queryBadgesExisting (args, badgeNames, callback) {
  'use strict';
  var startDateInclusive  = aggregateStartDate(args);
  var endDateInclusive    = aggregateEndDate(args);

  var query, values;
  // RID - We're looking at stats for a specific RID
  if (args.rid) {
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userId) as aggregate FROM mofointegration.vw_wm_metrics_referrers_and_badges \
                WHERE referrer = ? \
                AND (DATE(badgedOn) BETWEEN ? AND ?) \
                AND (DATE(badgedOn) < ridCreatedAt) \
                AND badgeName IN (?);';
    values = [args.rid, startDateInclusive, endDateInclusive, badgeNames];

  } else {
    // TOTAL - No RID supplied, so look at the total webmaker numbers instead
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userId) as aggregate FROM mofointegration.vw_wm_metrics_badges \
                WHERE DATE(badgedOn) < ? \
                AND (DATE(lastLoggedIn) BETWEEN ? AND ?) \
                AND badgeName IN (?);';
    values = [startDateInclusive, startDateInclusive, endDateInclusive, badgeNames];
  }

  getAggregate(query, values, function (err, res) {
    if (err) {
      console.error(err);
      callback(err);
    }
    callback(null, res);
  });
}

/**
 * The number of new users in a given time period, optionally filtered by RID
 * @param  {obj}   args (args.periodEndDate, args.periodLengthDays)
 * @param  {Function} callback
 */
function countUsersNew (args, callback) {
  'use strict';
  var startDateInclusive  = aggregateStartDate(args);
  var endDateInclusive    = aggregateEndDate(args);

  var query, values;
  // RID - We're looking at stats for a specific RID
  if (args.rid) {
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userIdHash) as aggregate FROM mofointegration.vw_wm_metrics_referrers \
                WHERE referrer = ? \
                AND (DATE(ridCreatedAt) BETWEEN ? AND ?) \
                AND userStatus = "new";';
    values = [args.rid, startDateInclusive, endDateInclusive];

  } else {
    // TOTAL - No RID supplied, so look at the total webmaker numbers instead
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userId) as aggregate FROM mofointegration.vw_wm_metrics_users \
                WHERE (DATE(createdAt) BETWEEN ? AND ?);';
    values = [startDateInclusive, endDateInclusive];
  }

  getAggregate(query, values, function (err, res) {
    if (err) {
      console.error(err);
      callback(err);
    }
    callback(null, res);
  });
}

/**
 * The number of existing users who were active in a given time period,
 * optionally filtered by a RID
 * @param  {ojb}   args
 * @param  {Function} callback
 */
function countUsersExisting (args, callback) {
  'use strict';
  var startDateInclusive  = aggregateStartDate(args);
  var endDateInclusive    = aggregateEndDate(args);

  var query, values;
  // RID - We're looking at stats for a specific RID
  if (args.rid) {
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userIdHash) as aggregate FROM mofointegration.vw_wm_metrics_referrers \
                WHERE referrer = ? \
                AND ((DATE(ridCreatedAt) BETWEEN ? AND ?) \
                  OR (DATE(ridUpdatedAt) BETWEEN ? AND ?)) \
                AND userStatus = "existing";';
    values = [args.rid, startDateInclusive, endDateInclusive, startDateInclusive, endDateInclusive];

  } else {
    // TOTAL - No RID supplied, so look at the total webmaker numbers instead
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userId) as aggregate FROM mofointegration.vw_wm_metrics_users \
               WHERE (DATE(createdAt) < ?) AND (DATE(updatedAt) BETWEEN ? AND ?);';
    values = [startDateInclusive, startDateInclusive, endDateInclusive];
  }

  getAggregate(query, values, function (err, res) {
    if (err) {
      console.error(err);
      callback(err);
    }
    callback(null, res);
  });
}


/**
 * The number of existing users who were active X days after signup,
 * @param  {ojb}   args (args.periodEndDate, args.periodLengthDays, args.retentionPeriodInDays)
 * @param  {Function} callback
 */
function usersRetained (args, callback) {
  'use strict';
  var startDateInclusive      = aggregateStartDate(args);
  var endDateInclusive        = aggregateEndDate(args);
  var retentionPeriodInDays   = args.retentionPeriodInDays;

  var query, values;

  /*jshint multistr: true */
  query = 'SELECT COUNT(DISTINCT userId) as aggregate FROM mofointegration.vw_wm_metrics_users \
             WHERE (DATE(createdAt) BETWEEN ? AND ?) \
             AND DATEDIFF(updatedAt, createdAt) >= ?;';
  values = [startDateInclusive, endDateInclusive, retentionPeriodInDays];

  getAggregate(query, values, function (err, res) {
    if (err) {
      console.error(err);
      callback(err);
    }
    callback(null, res);
  });
}

function mvcBadgeNew (args, callback) {
  'use strict';
  queryBadgesNew(args, BADGE_NAMES_MVC, function (err, res) {
    if (err) {
      console.error(err);
      return callback (err);
    }
    callback(null, res);
  });
}
function mvcBadgeExisting (args, callback) {
  'use strict';
  queryBadgesExisting(args, BADGE_NAMES_MVC, function (err, res) {
    if (err) {
      console.error(err);
      return callback (err);
    }
    callback(null, res);
  });
}

function eventHostsNew (args, callback) {
  'use strict';
  var startDateInclusive  = aggregateStartDate(args);
  var endDateInclusive    = aggregateEndDate(args);

  var query, values;
  // RID - We're looking at stats for a specific RID
  if (args.rid) {
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userId) as aggregate FROM mofointegration.vw_wm_metrics_referrers_and_events \
                WHERE referrer = ? \
                AND (DATE(eventDate) BETWEEN ? AND ?) \
                AND DATE(eventDate) > DATE(ridCreatedAt);';
    values = [args.rid, startDateInclusive, endDateInclusive];

  } else {
    // TOTAL - No RID supplied, so look at the total webmaker numbers instead
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userIdHash) as aggregate FROM mofointegration.vw_wm_metrics_teaching \
              WHERE (DATE(eventDate) BETWEEN ? AND ?);';
    values = [startDateInclusive, endDateInclusive];
  }

  getAggregate(query, values, function (err, res) {
    if (err) {
      console.error(err);
      callback(err);
    }
    callback(null, res);
  });
}


/**
 * The number of new mentors in a given time period, optionally filtered by RID
 * @param  {obj}   args
 * @param  {Function} callback
 */
function mentorsNew (args, callback) {
  'use strict';
  queryBadgesNew(args, BADGE_NAMES_MENTOR, function (err, res) {
    if (err) {
      console.error(err);
      return callback (err);
    }
    callback(null, res);
  });
}

function mentorsExisting (args, callback) {
  'use strict';
  queryBadgesExisting(args, BADGE_NAMES_MENTOR, function (err, res) {
    if (err) {
      console.error(err);
      return callback (err);
    }
    callback(null, res);
  });
}

function superMentorsNew (args, callback) {
  'use strict';
  queryBadgesNew(args, BADGE_NAMES_SUPER_MENTOR, function (err, res) {
    if (err) {
      console.error(err);
      return callback (err);
    }
    callback(null, res);
  });
}

function superMentorsExisting (args, callback) {
  'use strict';
  queryBadgesExisting(args, BADGE_NAMES_SUPER_MENTOR, function (err, res) {
    if (err) {
      console.error(err);
      return callback (err);
    }
    callback(null, res);
  });
}

function makersNew (args, callback) {
  'use strict';
  var startDateInclusive  = aggregateStartDate(args);
  var endDateInclusive    = aggregateEndDate(args);

  var query, values;
  // RID - We're looking at stats for a specific RID
  if (args.rid) {
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userIdHash) as aggregate FROM mofointegration.vw_wm_metrics_referrers_and_makes \
                WHERE referrer = ? \
                AND (DATE(makeCreatedAt) BETWEEN ? AND ?) \
                AND DATE(makeCreatedAt) > DATE(ridCreatedAt);';
    values = [args.rid, startDateInclusive, endDateInclusive];

  } else {
    // TOTAL - No RID supplied, so look at the total webmaker numbers instead
    /*jshint multistr: true */
    query = 'SELECT COUNT(DISTINCT userIdHash) as aggregate FROM mofointegration.vw_wm_metrics_makes \
                WHERE (DATE(createdAt) BETWEEN ? AND ?);';
    values = [startDateInclusive, endDateInclusive];
  }

  getAggregate(query, values, function (err, res) {
    if (err) {
      console.error(err);
      callback(err);
    }
    callback(null, res);
  });
}

/**
 * PRODUCT QUERIES
 */

/**
 * Description
 * @param  {obj}   args
 * @param  {Function} callback
 */
function productAUs (args, callback) {
  'use strict';
  if (!args.snapshotDate) {
    return callback('args.snapshotDate is required');
  }
  var snapshotDate = args.snapshotDate;
  countUsersActive (snapshotDate, snapshotDate, null, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

/**
 * Description
 * @param  {obj}   args
 * @param  {Function} callback
 */
function productNewUsers (args, callback) {
  'use strict';
  if (!args.snapshotDate) {
    return callback('args.snapshotDate is required');
  }
  var args2 = {};
  args2.periodEndDate = args.snapshotDate;
  args2.periodLengthDays = 1;
  countUsersNew (args2, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

/**
 * Description
 * @param  {obj}   args
 * @param  {Function} callback
 */
function productEUs (args, callback) {
  'use strict';
  if (!args.snapshotDate) {
    return callback('args.snapshotDate is required');
  }
  var snapshotDate = args.snapshotDate;
  countUsersMaking (snapshotDate, snapshotDate, null, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}


function productAURetentionXDays (args, callback) {
  'use strict';
  if (!args.snapshotDate || !args.retentionPeriodInDays) {
    return callback('missing args field in productAURetentionXDays()');
  }
  var snapshotDate = args.snapshotDate;
  var retentionPeriodInDays = args.retentionPeriodInDays;

  // The user range we care about is BETWEEN
  // snapshotDate - retentionPeriodInDays
  // AND
  // snapshotDate - retentionPeriodInDays - 7
  var userArgs = {};
  userArgs.periodEndDate = moment(snapshotDate)
                              .subtract(retentionPeriodInDays, 'days')
                              .format('YYYY-MM-DD');
  userArgs.periodLengthDays = 7; // we look at an extra week of data to get a
                                 // more meaningful average as some people come
                                 // back on the 8th, 9th, etc day rather than
                                 // exactly on day 7.
  userArgs.retentionPeriodInDays = args.retentionPeriodInDays;

  async.parallel({
    newUsers: function(callback){
      countUsersNew (userArgs, function (err, result) {
        callback(err, result);
      });
    },
    retainedUsers: function(callback){
      usersRetained (userArgs, function (err, result) {
        callback(err, result);
      });
    }
  },
  function(err, results) {
    console.log('newUsers:', results.newUsers);
    console.log('retainedUsers:', results.retainedUsers);
    var retentionRate = results.retainedUsers / results.newUsers;
    console.log('retentionRate:', retentionRate);
    callback(null, retentionRate);
  });

}

/**
 * Description
 * @param  {obj}   args
 * @param  {Function} callback
 * Reports on the % of users who joined 7-14 days prior to the snapshot date
 * who were active (updatedAt) more than 7 days after account creation
 */
function productAU7dayRetention (args, callback) {
  'use strict';
  args.retentionPeriodInDays = 7;
  productAURetentionXDays(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

/**
 * Description
 * @param  {obj}   args
 * @param  {Function} callback
 * Reports on the % of users who joined 30-37 days prior to the snapshot date
 * who were active (updatedAt) more than 30 days after their account creation
 */
function productAU30dayRetention (args, callback) {
  'use strict';
  args.retentionPeriodInDays = 30;
  productAURetentionXDays(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

/**
 * Description
 * @param  {obj}   args
 * @param  {Function} callback
 * Reports on the % of users who joined 90-97 days prior to the snapshot date
 * who were active (updatedAt) more than 90 days after their account creation
 */
function productAU90dayRetention (args, callback) {
  'use strict';
  args.retentionPeriodInDays = 90;
  productAURetentionXDays(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}



module.exports = {
  countUsersActive: countUsersActive,
  countUsersMaking: countUsersMaking,
  countUsersTeaching: countUsersTeaching,
  countUsersNew: countUsersNew,
  countUsersExisting: countUsersExisting,
  mvcBadgeNew: mvcBadgeNew,
  mvcBadgeExisting: mvcBadgeExisting,
  eventHostsNew: eventHostsNew,
  mentorsNew: mentorsNew,
  mentorsExisting: mentorsExisting,
  superMentorsNew: superMentorsNew,
  superMentorsExisting: superMentorsExisting,
  makersNew: makersNew,
  RIDsForDateRange: RIDsForDateRange,
  productAUs: productAUs,
  productNewUsers: productNewUsers,
  productEUs: productEUs,
  productAU7dayRetention: productAU7dayRetention,
  productAU30dayRetention: productAU30dayRetention,
  productAU90dayRetention: productAU90dayRetention
};
