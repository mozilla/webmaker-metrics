var async = require('async');
var moment = require('moment');
var db = require('../lib/models');
var integrationDb = require('../lib/integration-data');
var util = require('../lib/util');
var ga = require('../lib/googleanalytics');


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
function crunchForGivenDaysForRIDs (periodEndDate, periodLengthDays, callback) {
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
function runCrunchForRIDs (periodEndDate, callback) {
  'use strict';

  // run the stats for multiple ranges of days (DATE_RANGES_IN_DAYS)
  async.eachSeries(DATE_RANGES_IN_DAYS, function( days, callback ) {
      var periodLengthDays = days;

      crunchForGivenDaysForRIDs(periodEndDate, periodLengthDays, function (err) {
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
 * for RIDs to avoid running the process more than necessary
 * @param  {Function} callback
 * @return {Boolean}
 */
function hasCrunchRunTodayForRids (callback) {
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
 * The main function for RIDs data. Checks if the crunch has been run today
 * and if not, starts the crunch process
 * @param  {Function} callback
 * @return {err, String}
 */
function updateRIDMetrics (callback) {
  'use strict';

  // we only need to run this once per day
  hasCrunchRunTodayForRids(function (err, hasRun) {
    if (err) {
      return callback(err);
    }

    if (hasRun) {
      // exit early
      return callback(null, 'Crunch has already run today for RIDs.');
    }

    // integration DB updates daily, so we look at stats up until yesterday
    var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    runCrunchForRIDs(yesterday, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Crunch run complete');
    });
  });
}


/**
 * Initiates a number crunching excercise for a given date
 * @param  {date}   snapshotDate - format('YYYY-MM-DD')
 * @param  {Function} callback
 * @return {string} error
 */
function runCrunchForProductFunnel (snapshotDate, callback) {
  'use strict';
  var qryObj = {
    snapshotDate: snapshotDate,
  };


  // create a product funnel snapshot obj to save
  var snapshot = {
    snapshotDate: snapshotDate
  };

  // work through each of the queries we need to run in parallel
  async.parallelLimit({

    // Unique Visitors
    UVs: function(callback){
      ga.productUVs(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.UVs = res;
        callback();
      });
    },

    // Active Users
    AUs: function(callback){
      integrationDb.productAUs(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.AUs = res;
        callback();
      });
    },

    // Engaged Users
    EUs: function(callback){
      integrationDb.productEUs(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.EUs = res;
        callback();
      });
    },

    // 7 Day Retention
    AU7dayRetention: function(callback){
      integrationDb.productAU7dayRetention(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.AU7dayRetention = res;
        callback();
      });
    },

    // 30 Day Retention
    AU30dayRetention: function(callback){
      integrationDb.productAU30dayRetention(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.AU30dayRetention = res;
        callback();
      });
    },

  },
  4, // << the 'limit' for parallelLimit()
  function(err) {
    // END OF async.parallelLimit()
    if (err) {
      console.error(err);
    }
    // calculations
    snapshot.UVtoAU = snapshot.AUs / snapshot.UVs;
    snapshot.UVtoEU = snapshot.EUs / snapshot.UVs;
    snapshot.AUtoEU = snapshot.EUs / snapshot.AUs;

    // Save the object we've built
    // check to see if we've already run this day
    var qry = {};
    qry.where = { snapshotDate: snapshotDate};
    db.ProductFunnelSnapshot.find(qry)

      .error(function (err) {
      // Error
      console.error(err);
      return callback(err);
      })

      .complete(function(err, returnedSnapshot) {
        // check if a snapshot has already been taken for this day
        if (returnedSnapshot && returnedSnapshot.values.id) {
          console.log('UPDATING existing snapshot');
          db.ProductFunnelSnapshot.update(snapshot, qry)
            .complete(function () {
              console.log('UPDATED existing snapshot');
              return callback();
            }
          );
        } else {
          // else it's a new snapshot
          console.log('SAVING new snapshot');
          db.ProductFunnelSnapshot.create(snapshot)
            .complete(function () {
              console.log('SAVED new snapshot');
              return callback();
            }
          );
        }
    });
  });

}


/**
 * Checks the database to see if the number crunching has already run today
 * for RIDs to avoid running the process more than necessary
 * @param  {Function} callback
 * @return {Boolean}
 */
function hasCrunchRunTodayForProduct (callback) {
  'use strict';

  // while in dev, just return false
  return callback(false);

  // db.ProductFunnelSnapshot.findAndCountAll({
  //    where: ['createdAt > ?', moment(5, 'HH').format()]
  // })
  // .success(function(result) {
  //   if (result.count > 0) {
  //     return callback(null, true);
  //   }
  //   return callback(null, false);
  // });
}


/**
 * The main function for Product Funnel data. Checks if the crunch has been run
 * today and if not, starts the crunch process
 * @param  {Function} callback
 * @return {err, String}
 */
function updateWebmakerProductFunnel (callback) {
  'use strict';

   // we only need to run this once per day
  hasCrunchRunTodayForProduct(function (err, hasRun) {
    if (err) {
      return callback(err);
    }

    if (hasRun) {
      return callback(null, 'Crunch has already run today for Product Funnel.');
    }

  // Might want to each day re-run the last 7 days,
  // so the retention data average updates

    // integration DB updates daily, so we look at stats up until yesterday
    var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    runCrunchForProductFunnel(yesterday, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Crunch run complete');
    });
  });
}

/**
 * updateProductFunnel7Days - useful to backfill the DB if needed
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function updateProductFunnel7Days (callback) {
  'use strict';
  var datesWeCareAbout = [];
  for (var i = 0; i <= 7; i++) {
    datesWeCareAbout.push(moment().subtract(1 + i, 'days').format('YYYY-MM-DD'));
  }
  async.each(datesWeCareAbout, function(date, callback) {
    runCrunchForProductFunnel(date, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Crunch run complete for ' + date);
    });
  }, function(err){
    if( err ) {
      console.error('A file failed to process');
      return callback(err);
    }
    console.log('Finished running updateProductFunnel7Days()');
    return callback();
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
  updateEngagementMetrics: updateEngagementMetrics,
  updateWebmakerProductFunnel: updateWebmakerProductFunnel,
  updateProductFunnel7Days: updateProductFunnel7Days
};
