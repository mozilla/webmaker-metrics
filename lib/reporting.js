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
      console.log(results);
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
      console.log(data);
      callback(null, data);
    });
}

function productUVs (callback) {
  'use strict';
  var args = {metricName: 'UVs', days: 7};
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
  var args = {metricName: 'UVtoAU', days: 7, x100: true};
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
  var args = {metricName: 'UVtoNewUser', days: 7, x100: true};
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
  var args = {metricName: 'AU7dayRetention', days: 7, x100: true};
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
  // TODO
  var args = {metricName: 'AU30dayRetention', days: 7, x100: true};
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
  // TODO
  var args = {metricName: 'UVtoEU', days: 7, x100: true};
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
  // TODO
  var args = {metricName: 'AUtoEU', days: 7, x100: true};
  getProductSnapshotValue(args, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null, result);
  });
}

module.exports = {
  latestRIDs: latestRIDs,
  productUVs: productUVs,
  productUVtoAU: productUVtoAU,
  productUVtoNewUser: productUVtoNewUser,
  productRetention7Day: productRetention7Day,
  productRetention30Day: productRetention30Day,
  productUVtoEU: productUVtoEU,
  productAUtoEU: productAUtoEU
};
