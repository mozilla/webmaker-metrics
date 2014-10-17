var async = require('async');
var moment = require('moment');
var db = require('../lib/models');
var integrationDb = require('../lib/integration-data');
var util = require('../lib/util');


var DATE_RANGES_IN_DAYS = [14,30,90,360];


/**
 * Generate stats for a given RID and date range
 * @param  {Date}   periodEndDate
 * @param  {Int}   periodLengthDays
 * @param  {String}   rid
 * @param  {Function} callback
 */
function crunchForDaysForRID (periodEndDate, periodLengthDays, rid, callback) {
  'use strict';
  var qryObj = {
    periodEndDate: periodEndDate,
    periodLengthDays: periodLengthDays,
    rid: rid,
  };

  var ridToSave = rid || 'Webmaker Total';

  var toSave = {
    periodEndDate: periodEndDate,
    periodLengthDays: periodLengthDays,
    referralCode: ridToSave,
  };

  // work through each of the queries we need to run in parallel
  async.parallelLimit({

    // USERS NEW
    usersNew: function(callback){
      integrationDb.usersNew(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.usersNew = res;
        callback();
      });
    },

    // USERS REPEAT
    usersExisting: function(callback){
      integrationDb.usersExisting(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.usersExisting = res;
        callback();
      });
    },

    // MVC BADGES NEW
    mvcBadgeNew: function(callback){
      integrationDb.mvcBadgeNew(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.mvcBadgeNew = res;
        callback();
      });
    },

    // MVC BADGES REPEAT
    mvcBadgeExisting: function(callback){
      integrationDb.mvcBadgeExisting(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.mvcBadgeExisting = res;
        callback();
      });
    },

    // EVENT HOST NEW
    eventHostsNew: function(callback){
      integrationDb.eventHostsNew(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.eventHostsNew = res;
        callback();
      });
    },

    // MENTOR - NEW
    mentorsNew: function(callback){
      integrationDb.mentorsNew(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.mentorsNew = res;
        callback();
      });
    },

    // MENTOR - REPEAT
    mentorsExisting: function(callback){
      integrationDb.mentorsExisting(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.mentorsExisting = res;
        callback();
      });
    },

    // SUPER MENTOR - NEW
    superMentorsNew: function(callback){
      integrationDb.superMentorsNew(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.superMentorsNew = res;
        callback();
      });
    },

    // SUPER MENTOR - REPEAT
    superMentorsExisting: function(callback){
      integrationDb.superMentorsExisting(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.superMentorsExisting = res;
        callback();
      });
    },

    // MAKER - NEW
    makersNew: function(callback){
      integrationDb.makersNew(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.makersNew = res;
        callback();
      });
    }

  },
  3, // << the 'limit' for parallelLimit()
  function(err) {
    // END OF async.parallelLimit()
    if (err) {
      console.error(err);
    }

    // Save the object we've built
    db.Aggregate.create(toSave).error(function (err) {
      // Error
      console.error(err);
      return callback(err);

    }).success(function() {
      // Success
      console.log('Saved');
      return callback();
    });
  });

}


/**
 * For the given date range, generate the numbers we care about
 * @param  {Date}   periodEndDate
 * @param  {Int}   periodLengthDays
 * @param  {Function} callback
 */
function crunchForGivenDays (periodEndDate, periodLengthDays, callback) {
  'use strict';

  // get all the referral codes in this time period
  integrationDb.RIDsForDateRange({ periodEndDate: periodEndDate, periodLengthDays: periodLengthDays },  function (err, rids) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    async.eachSeries(rids, function( rid, callback) {

      console.log('Crunching for RID:', rid);

      crunchForDaysForRID(periodEndDate, periodLengthDays, rid, function (err) {
        if (err) {
          console.error(err);
          return callback(err);
        }
        callback();
      });

    }, function(err){
        // Finished crunching
        if( err ) {
          console.error(err);
          return callback(err);
        }
        return callback();
    });

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

  // run the stats for multiple ranges of days (DATE_RANGES_IN_DAYS)
  async.eachSeries(DATE_RANGES_IN_DAYS, function( days, callback ) {
      var periodLengthDays = days;

      crunchForGivenDays(periodEndDate, periodLengthDays, function (err) {
        if (err) {
          console.error(err);
          return callback(err);
        }
        callback();
      });

    }, function(err) {
        // Finished crunching
        if( err ) {
          console.error(err);
          return callback(err);
        }
        return callback();
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

  db.Aggregate.findAndCountAll({
     where: ['createdAt > ?', moment(5, 'HH').format()]
  })
  .success(function(result) {
    if (result.count > 0) {
      return callback(null, true);
    }
    return callback(null, false);
  });
}


/**
 * The main function for this module. Checks if the crunch has been run today
 * and if not, starts the crunch process
 * @param  {Function} callback
 * @return {err, String}
 */
function updateRIDMetrics (callback) {
  'use strict';

  // we only need to run this once per day
  hasCrunchRunToday(function (err, hasRun) {
    if (err) {
      return callback(err);
    }

    if (hasRun) {
      // exit early
      return callback(null, 'Crunch has already run today.');
    }

    // integration DB updates daily, so we look at stats up until yesterday
    var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    runCrunch(yesterday, function (err) {
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
  updateRIDMetrics: updateRIDMetrics,
  updateEngagementMetrics: updateEngagementMetrics
};
