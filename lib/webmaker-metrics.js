var async = require('async');
var moment = require('moment');
var clone = require('clone');
var db = require('../lib/models');
var integrationDb = require('../lib/integration-data');
var util = require('../lib/util');
var ga = require('../lib/googleanalytics');
var request = require('request');


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
      integrationDb.countUsersNew(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        toSave.usersNew = res;
        callback();
      });
    },

    // USERS REPEAT
    usersExisting: function(callback){
      integrationDb.countUsersExisting(qryObj, function (err, res) {
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

    // New Users
    NewUsers: function(callback){
      integrationDb.productNewUsers(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.NewUsers = res;
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

    // 90 Day Retention
    AU90dayRetention: function(callback){
      integrationDb.productAU90dayRetention(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.AU90dayRetention = res;
        callback();
      });
    },

    // 7 Day Retained
    RetainedUsers7days: function(callback){
      integrationDb.productRetainedUsers7days(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.RetainedUsers7days = res;
        callback();
      });
    },

    // 30 Day Retained
    RetainedUsers30days: function(callback){
      integrationDb.productRetainedUsers30days(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.RetainedUsers30days = res;
        callback();
      });
    },

    // 90 Day Retained
    RetainedUsers90days: function(callback){
      integrationDb.productRetainedUsers90days(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.RetainedUsers90days = res;
        callback();
      });
    }

  },
  4, // << the 'limit' for parallelLimit()
  function(err) {
    // END OF async.parallelLimit()
    if (err) {
      console.error(err);
    }
    // calculations
    snapshot.UVtoNewUser = snapshot.NewUsers / snapshot.UVs;
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
 * The main function for Product Funnel data.
 * @param  {Function} callback
 * @return {err, String}
 */
function updateWebmakerProductFunnel (callback) {
  'use strict';

  // integration DB updates daily, so we look at stats up until yesterday
  var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  runCrunchForProductFunnel(yesterday, function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, 'Product funnel crunch run complete');
  });
}

/**
 * updateProductFunnel7Days - useful to backfill the DB if needed
 * @param  {Function} callback
 * @return {[type]}
 */
function updateProductFunnel7Days (callback) {
  'use strict';
  var datesWeCareAbout = [];
  for (var i = 0; i <= 60; i++) {
    datesWeCareAbout.push(moment().subtract(1 + i, 'days').format('YYYY-MM-DD'));
  }
  async.eachLimit(datesWeCareAbout, 2, function(date, callback) {
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
 * RELATIONSHIPS
 */

/**
 * Initiates a number crunching excercise for a given date
 * @param  {date}   snapshotDate - format('YYYY-MM-DD')
 * @param  {Function} callback
 * @return {string} error
 */
function runCrunchForRelationships (snapshotDate, callback) {
  'use strict';
  var qryObj = {
    snapshotDate: snapshotDate,
    periodLengthDays: 30
  };

  var activeUsers = 0;

  // create a snapshot obj to save
  var snapshotToSave = {
    snapshotDate: snapshotDate
  };

  // work through each of the queries we need to run in parallel
  async.parallelLimit({

    // Active users
    ActiveUsers: function(callback){

      integrationDb.productAUs(qryObj, function (err, res) {
        if (err) {
          console.error(err);
        }
        activeUsers = res;
        callback();
      });
    }

    // we can add in learning networks db calls here
    // once there is people data to include

  },
  4, // << the 'limit' for parallelLimit()
  function(err) {
    // END OF async.parallelLimit()
    if (err) {
      console.error(err);
    }
    snapshotToSave.people = activeUsers;

    // Save the object we've built
    db.RelationshipsSnapshot.upsert(snapshotToSave)
        .then(function () {
          return callback();
        }
      );
  });
}

/**
 * The main function for Relationship counts.
 * @param  {Function} callback
 * @return {err, String}
 */
function updateRelationships (callback) {
  'use strict';

    // integration DB updates daily, so we look at stats up until yesterday
    var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    runCrunchForRelationships(yesterday, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Relationship crunch run complete');
    });
}

/**
 * backdateRelationships - useful to backfill the DB if needed
 * @param  {Function} callback
 */
function backdateRelationships (callback) {
  'use strict';
  var datesWeCareAbout = [];
  for (var i = 0; i <= 120; i++) {
    datesWeCareAbout.push(moment().subtract(1 + i, 'days').format('YYYY-MM-DD'));
  }
  async.eachLimit(datesWeCareAbout, 10, function(date, callback) {
    runCrunchForRelationships(date, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Crunch run complete for ' + date);
    });
  }, function(err){
    if( err ) {
      return callback(err);
    }
    console.log('Finished running backdateRelationships()');
    return callback();
  });
}


/**
 * EMAIL OPT INS
 */

/**
 * Initiates a number crunching excercise for a given date
 * @param  {date}   snapshotDate - format('YYYY-MM-DD')
 * @param  {Function} callback
 * @return {string} error
 */
function runCrunchForEmailOptin (snapshotDate, callback) {
  'use strict';
  var qryObj = {
    snapshotDate: snapshotDate,
  };


  // create a snapshot obj to save
  var snapshot = {
    snapshotDate: snapshotDate
  };

  // work through each of the queries we need to run in parallel
  async.parallelLimit({

    // New Users 1 day
    NewUsers1day: function(callback){
      var thisQry = clone(qryObj);
      thisQry.periodLengthDays = 1;
      integrationDb.productNewUsers(thisQry, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.NewUsers1day = res;
        callback();
      });
    },

    // New User Optins 1 day
    NewUserOptins1day: function(callback){
      var thisQry = clone(qryObj);
      thisQry.periodLengthDays = 1;
      integrationDb.productNewUserOptins(thisQry, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.NewUserOptins1day = res;
        callback();
      });
    },

    // New Users 7 days
    NewUsers7days: function(callback){
      var thisQry = clone(qryObj);
      thisQry.periodLengthDays = 7;
      integrationDb.productNewUsers(thisQry, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.NewUsers7days = res;
        callback();
      });
    },

    // New User Optins 7 days
    NewUserOptins7days: function(callback){
      var thisQry = clone(qryObj);
      thisQry.periodLengthDays = 7;
      integrationDb.productNewUserOptins(thisQry, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.NewUserOptins7days = res;
        callback();
      });
    },

    // New Users 7 days
    NewUsers30days: function(callback){
      var thisQry = clone(qryObj);
      thisQry.periodLengthDays = 30;
      integrationDb.productNewUsers(thisQry, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.NewUsers30days = res;
        callback();
      });
    },

    // New User Optins 30 days
    NewUserOptins30days: function(callback){
      var thisQry = clone(qryObj);
      thisQry.periodLengthDays = 30;
      integrationDb.productNewUserOptins(thisQry, function (err, res) {
        if (err) {
          console.error(err);
        }
        snapshot.NewUserOptins30days = res;
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
    snapshot.NewUserOptinRate1day = snapshot.NewUserOptins1day / snapshot.NewUsers1day;
    snapshot.NewUserOptinRate7days = snapshot.NewUserOptins7days / snapshot.NewUsers7days;
    snapshot.NewUserOptinRate30days = snapshot.NewUserOptins30days / snapshot.NewUsers30days;

    // Save the object we've built
    // check to see if we've already run this day
    var qry = {};
    qry.where = { snapshotDate: snapshotDate};
    db.EmailOptinSnapshot.find(qry)

      .error(function (err) {
      // Error
      console.error(err);
      return callback(err);
      })

      .complete(function(err, returnedSnapshot) {
        // check if a snapshot has already been taken for this day
        if (returnedSnapshot && returnedSnapshot.values.id) {
          console.log('UPDATING existing snapshot');
          db.EmailOptinSnapshot.update(snapshot, qry)
            .complete(function () {
              console.log('UPDATED existing snapshot');
              return callback();
            }
          );
        } else {
          // else it's a new snapshot
          console.log('SAVING new snapshot');
          db.EmailOptinSnapshot.create(snapshot)
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
 * The main function for Email Opt in data.
 * @param  {Function} callback
 * @return {err, String}
 */
function updateEmailOptins (callback) {
  'use strict';

    // integration DB updates daily, so we look at stats up until yesterday
    var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    runCrunchForEmailOptin(yesterday, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Email optin crunch run complete');
    });
}

/**
 * updateEmailOptins7Days - useful to backfill the DB if needed
 * @param  {Function} callback
 * @return {[type]}
 */
function updateEmailOptins7Days (callback) {
  'use strict';
  var datesWeCareAbout = [];
  for (var i = 0; i <= 7; i++) {
    datesWeCareAbout.push(moment().subtract(1 + i, 'days').format('YYYY-MM-DD'));
  }
  async.each(datesWeCareAbout, function(date, callback) {
    runCrunchForEmailOptin(date, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Crunch run complete for ' + date);
    });
  }, function(err){
    if( err ) {
      return callback(err);
    }
    console.log('Finished running updateEmailOptins7Days()');
    return callback();
  });
}


/**
 * ENGAGEMENT METRICS
 */


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

    var args = {
      periodStartDate: startDateInclusive,
      periodEndDate: endDateInclusive
    };

    // for each date range, get the metrics we care about
    async.parallel({

      // COUNT USERS ACTIVE
      usersActive: function(callback){
        integrationDb.countUsersActive(args, function (err, res) {
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

function saveLatestClubsCount (count, callback) {
  var snapshotDate = moment().format('YYYY-MM-DD');

  db.LearningNetworkSnapshot.findOne({
    order: [
      ['snapshotDate', 'DESC']
    ]
  }).then(function(latestSnapshot) {

    var snapshot = {

      // copy the latest values
      snapshotDate: snapshotDate,
      people: 0,
      cities: latestSnapshot.cities,
      hiveCities: latestSnapshot.hiveCities,
      loggedBy: latestSnapshot.loggedBy,

      // add the clubs count
      clubs: count
    };

    console.log(snapshot);

    // upsert
    db.LearningNetworkSnapshot.upsert(snapshot)
      .then(function () {
        callback();
      }
    );
  });
}

/**
 * Fetch the clubs from teach api. Count, and save the latest record.
 * @param  {Function} callback
 */
function updateClubs (callback) {
  'use strict';

  request('https://teach-api-production.herokuapp.com/api/clubs/', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if (body) {
        try {
          var clubs = JSON.parse(body);
          saveLatestClubsCount(clubs.length, function () {
            callback();
          });
        } catch (e) {
          // An error has occured, handle it, by e.g. logging it
          console.error('Error in json for teach-api-productionl');
          console.log(e);
          callback();
        }

      } else {
        console.error('Error fetching from teach-api-productionl: no body');
        callback();
      }
    } else {
      console.error('Error fetching from teach-api-production');
      callback();
    }
  });


}



module.exports = {
  updateRIDMetrics: updateRIDMetrics,
  updateEngagementMetrics: updateEngagementMetrics,
  updateWebmakerProductFunnel: updateWebmakerProductFunnel,
  updateProductFunnel7Days: updateProductFunnel7Days,
  updateEmailOptins: updateEmailOptins,
  updateEmailOptins7Days: updateEmailOptins7Days,
  updateRelationships: updateRelationships,
  backdateRelationships: backdateRelationships,
  updateClubs: updateClubs
};
