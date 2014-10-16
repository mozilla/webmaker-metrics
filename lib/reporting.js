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

module.exports = {
  latestRIDs: latestRIDs,
};
