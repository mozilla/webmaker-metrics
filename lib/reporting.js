var db = require('../lib/models');
var moment = require('moment');



function lastCrunchedRids (callback) {
  'use strict';

  db.Aggregate.find({order: '`createdAt` DESC'})
    .success(function (latestItem) {
      var lastUpdated = moment(latestItem.createdAt).format('YYYY-MM-DD');
      console.log(lastUpdated);
      callback(null, lastUpdated);
    });
}

function latestRIDs (callback) {
  'use strict';

  lastCrunchedRids(function (err, lastUpdated) {
    db.Aggregate.findAll({ where : ['createdAt > ?', lastUpdated]})
      .success(function (aggregates) {
        callback(null, aggregates);
      });
  });
}


/**
 * Country Data
 */

function lastCrunchedCountryData (callback) {
  'use strict';

  db.CountryDataSnapshot.find({order: '`snapshotDate` DESC'})
    .success(function (latestItem) {
      var lastUpdated = moment(latestItem.snapshotDate).format('YYYY-MM-DD');
      callback(null, lastUpdated);
    });
}

function latestCountryData (callback) {
  'use strict';

  lastCrunchedCountryData(function (err, lastUpdated) {
    db.CountryDataSnapshot.findAll({ where : ['snapshotDate = ?', lastUpdated]})
      .success(function (countryData) {
        callback(null, countryData);
      });
  });
}

function targetCountries (callback) {
  'use strict';
  var thirtyDaysAgo = moment().subtract(90, 'days').format('YYYY-MM-DD');

  var countryList = [
    'Total',
    'India',
    'Bangladesh',
    'Kenya',
    'Brazil',
    'United Kingdom',
    'South Korea'
  ];
  var qry = {};
  qry.where = {
    snapshotDate : { gt: thirtyDaysAgo },
    country : { in: countryList }
  };
  qry.order = '`snapshotDate` DESC';

  db.CountryDataSnapshot.findAll(qry)
  .success(function (results) {

    var countryData = [];

    function addToCountryData (snapshotDate, country, rate) {
      snapshotDate = moment(snapshotDate).format('YYYY-MM-DD');

      // first see if we've created an entry for this date
      var existsAlready = false;
      for (var i = 0; i < countryData.length; i++) {
        if (countryData[i].date === snapshotDate) {
          existsAlready = true;
          countryData[i][country] = rate;
        }
      }

      if (!existsAlready) {
        var newDateEntry = {
          "date": snapshotDate
        };
        newDateEntry[country] = rate;
        countryData.push(newDateEntry);
      }
    }
    for (var i = 0; i < results.length; i++) {
      addToCountryData(results[i].snapshotDate, results[i].country, results[i].UVsToInternetUsers);
    }

    callback(null, countryData);
  });

}

/**
 * PRODUCT
 */


/**
 * [getProductSnapshotValue description]
 * @param  {[type]}   args (metricName, days, x100)
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function getProductSnapshotValue (args, callback) {
  var qry = {};
  qry.limit = args.days;
  qry.order = '`snapshotDate` DESC';
  db.ProductFunnelSnapshot.findAll( qry )
    .success(function (results) {
      //console.log(results);
      var data = [];
      for (var i = 0; i < results.length; i++) {
        var date = moment(results[i].dataValues.snapshotDate).format('YYYY-MM-DD');
        var value = results[i].dataValues[args.metricName];
        if (args.x100) {
          value = value * 100; // used to create percentages
        }
        var snapshot = {
          "date": date,
          "value": value
        };
        data.push(snapshot);
      }
      //console.log(data);
      callback(null, data);
    });
}

function productMAUs (callback) {
  var qry = {};
  qry.limit = 30;
  qry.order = '`snapshotDate` DESC';
  db.RelationshipsSnapshot.findAll( qry )
    .success(function (results) {
      var data = [];
      for (var i = 0; i < results.length; i++) {
        var date = moment(results[i].dataValues.snapshotDate).format('YYYY-MM-DD');
        var value = results[i].dataValues.people;
        var snapshot = {
          "date": date,
          "value": value
        };
        data.push(snapshot);
      }
      callback(null, data);
    });
}

function productUVs (callback) {
  'use strict';
  var args = {metricName: 'UVs', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productNewUsers (callback) {
  'use strict';
  var args = {metricName: 'NewUsers', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productUVtoAU (callback) {
  'use strict';
  var args = {metricName: 'UVtoAU', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productUVtoNewUser (callback) {
  'use strict';
  var args = {metricName: 'UVtoNewUser', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productRetention7Day (callback) {
  'use strict';
  var args = {metricName: 'AU7dayRetention', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productRetention30Day (callback) {
  'use strict';
  var args = {metricName: 'AU30dayRetention', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productRetention90Day (callback) {
  'use strict';
  var args = {metricName: 'AU90dayRetention', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productRetained7Days (callback) {
  'use strict';
  var args = {metricName: 'RetainedUsers7days', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productRetained30Days (callback) {
  'use strict';
  var args = {metricName: 'RetainedUsers30days', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productRetained90Days (callback) {
  'use strict';
  var args = {metricName: 'RetainedUsers90days', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productUVtoEU (callback) {
  'use strict';
  var args = {metricName: 'UVtoEU', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function productAUtoEU (callback) {
  'use strict';
  var args = {metricName: 'AUtoEU', days: 30};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

/**
 * EMAIL
 */

/**
 * [getEmailOptinSnapshotValue description]
 * @param  {[type]}   args (metricName, days, x100)
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function getEmailOptinSnapshotValue (args, callback) {
  var qry = {};
  qry.limit = args.days;
  qry.order = '`snapshotDate` DESC';
  db.EmailOptinSnapshot.findAll( qry )
    .success(function (results) {
      //console.log(results);
      var data = [];
      for (var i = 0; i < results.length; i++) {
        var date = moment(results[i].dataValues.snapshotDate).format('YYYY-MM-DD');
        var value = results[i].dataValues[args.metricName];
        if (args.x100) {
          value = value * 100; // used to create percentages
        }
        var snapshot = {
          "date": date,
          "value": value
        };
        data.push(snapshot);
      }
      //console.log(data);
      callback(null, data);
    });
}

function emailOptinRate1day (callback) {
  'use strict';
  var args = {metricName: 'NewUserOptinRate1day', days: 14};
  getEmailOptinSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function emailOptins1day (callback) {
  'use strict';
  var args = {metricName: 'NewUserOptins1day', days: 14};
  getEmailOptinSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function emailOptinRate7days (callback) {
  'use strict';
  var args = {metricName: 'NewUserOptinRate7days', days: 14};
  getEmailOptinSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function emailOptinRate30days (callback) {
  'use strict';
  var args = {metricName: 'NewUserOptinRate30days', days: 14};
  getEmailOptinSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

/**
 * LEARNING NETWORKS
 */

function getLearningNetworkSnapshotValue (args, callback) {
  var qry = {};
  qry.order = '`snapshotDate` DESC';
  db.LearningNetworkSnapshot.findAll( qry )
    .success(function (results) {
      var data = [];
      for (var i = 0; i < results.length; i++) {
        var date = moment(results[i].dataValues.snapshotDate).format('YYYY-MM-DD');
        var value = results[i].dataValues[args.metricName];
        var snapshot = {
          "date": date,
          "value": value
        };
        data.push(snapshot);
      }
      callback(null, data);
    });
}

function learningNetworkCities (callback) {
  'use strict';
  var args = {metricName: 'cities'};
  getLearningNetworkSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function learningNetworkPeople (callback) {
  'use strict';
  var args = {metricName: 'people'};
  getLearningNetworkSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function learningNetworkHiveCities (callback) {
  'use strict';
  var args = {metricName: 'hiveCities'};
  getLearningNetworkSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

function learningNetworkClubs (callback) {
  'use strict';
  var args = {metricName: 'clubs'};
  getLearningNetworkSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

/**
 * RELATIONSHIPS
 */

function mofoPeople (callback) {
  var qry = {};
  qry.where = {
    snapshotDate : { gt: new Date(2014,11,31) } // month is 0 index
  };
  qry.order = '`snapshotDate` DESC';
  db.RelationshipsSnapshot.findAll( qry )
    .success(function (results) {
      var data = [];
      for (var i = 0; i < results.length; i++) {
        var date = moment(results[i].dataValues.snapshotDate).format('YYYY-MM-DD');
        var value = results[i].dataValues.people;
        var snapshot = {
          "date": date,
          "value": value
        };
        data.push(snapshot);
      }
      callback(null, data);
    });
}


module.exports = {
  latestRIDs: latestRIDs,
  productMAUs: productMAUs,
  productUVs: productUVs,
  productNewUsers: productNewUsers,
  productUVtoAU: productUVtoAU,
  productUVtoNewUser: productUVtoNewUser,
  productRetention7Day: productRetention7Day,
  productRetention30Day: productRetention30Day,
  productRetention90Day: productRetention90Day,
  productRetained7Days: productRetained7Days,
  productRetained30Days: productRetained30Days,
  productRetained90Days: productRetained90Days,
  productUVtoEU: productUVtoEU,
  productAUtoEU: productAUtoEU,
  emailOptinRate1day: emailOptinRate1day,
  emailOptinRate7days: emailOptinRate7days,
  emailOptinRate30days: emailOptinRate30days,
  emailOptins1day: emailOptins1day,
  learningNetworkCities: learningNetworkCities,
  learningNetworkPeople: learningNetworkPeople,
  learningNetworkHiveCities: learningNetworkHiveCities,
  learningNetworkClubs: learningNetworkClubs,
  latestCountryData: latestCountryData,
  targetCountries: targetCountries,
  mofoPeople: mofoPeople
};
