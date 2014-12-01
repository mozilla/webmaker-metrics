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

function productUVs (callback) {
  'use strict';
  // TODO
  var data =     [
        { "date": "2015-01-02", "value": 3204    },
        { "date": "2015-01-03", "value": 3100    },
        { "date": "2015-01-04", "value": 2900    },
        { "date": "2015-01-05", "value": 3190    },
        { "date": "2015-01-06", "value": 3500    },
        { "date": "2015-01-07", "value": 3460    },
        { "date": "2015-01-01", "value": 3769    }
    ];
  callback(null, data);
}

function productUVtoAU (callback) {
  'use strict';
  // TODO
  var data =     [
        { "date": "2015-01-02", "value": 2.7    },
        { "date": "2015-01-03", "value": 2.6    },
        { "date": "2015-01-04", "value": 2.9    },
        { "date": "2015-01-05", "value": 2.7    },
        { "date": "2015-01-06", "value": 2.876    },
        { "date": "2015-01-07", "value": 2.99    },
        { "date": "2015-01-01", "value": 3.04    }
    ];
  callback(null, data);
}

function productRetention7Day (callback) {
  'use strict';
  // TODO
  var data =     [
        { "date": "2015-01-02", "value": 0.87    },
        { "date": "2015-01-03", "value": 0.90    },
        { "date": "2015-01-04", "value": 0.88    },
        { "date": "2015-01-05", "value": 0.95    },
        { "date": "2015-01-06", "value": 1.02    },
        { "date": "2015-01-07", "value": 1.09    },
        { "date": "2015-01-01", "value": 1.28    }
    ];
  callback(null, data);
}

function productRetention30Day (callback) {
  'use strict';
  // TODO
  var data =     [
        { "date": "2015-01-02", "value": 0.05    },
        { "date": "2015-01-03", "value": 0.04    },
        { "date": "2015-01-04", "value": 0.06    },
        { "date": "2015-01-05", "value": 0.05    },
        { "date": "2015-01-06", "value": 0.08    },
        { "date": "2015-01-07", "value": 0.11    },
        { "date": "2015-01-01", "value": 0.19    }
    ];
  callback(null, data);
}

module.exports = {
  latestRIDs: latestRIDs,
  productUVs: productUVs,
  productUVtoAU: productUVtoAU,
  productRetention7Day: productRetention7Day,
  productRetention30Day: productRetention30Day
};
