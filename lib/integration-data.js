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
                    AND ((DATE(lastLoggedIn) >= ?) OR (DATE(createdAt) >= ?));';
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
 * Runs a query that returns the result of a COUNT() as 'aggregate'
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
 * @param  {obj}   args
 * @param  {Function} callback
 */
function usersNew (args, callback) {
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
function usersExisting (args, callback) {
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
               WHERE (DATE(createdAt) < ?) AND (DATE(lastLoggedIn) BETWEEN ? AND ?);';
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




module.exports = {
  countUsersActive: countUsersActive,
  countUsersMaking: countUsersMaking,
  countUsersTeaching: countUsersTeaching,
  usersNew: usersNew,
  usersExisting: usersExisting,
  mvcBadgeNew: mvcBadgeNew,
  mvcBadgeExisting: mvcBadgeExisting,
  eventHostsNew: eventHostsNew,
  mentorsNew: mentorsNew,
  mentorsExisting: mentorsExisting,
  superMentorsNew: superMentorsNew,
  superMentorsExisting: superMentorsExisting,
  makersNew: makersNew,
  RIDsForDateRange: RIDsForDateRange,
};
