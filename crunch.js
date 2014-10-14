var webmakerMetrics = require('./lib/webmaker-metrics.js');
var appmaker = require('./lib/appmaker_temp.js');

webmakerMetrics.updateRIDMetrics(function (err, res) {
  'use strict';
  if (err) {
    console.error(err);
    process.exit(0);
  }
  console.log(res);
  //process.exit(0);
});

// webmakerMetrics.updateEngagementMetrics(function (err, res) {
//   'use strict';
//   if (err) {
//     console.error(err);
//     process.exit(0);
//   }
// });

// UPDATE APPMAKER
// appmaker.refreshStats(function (err) {
//   'use strict';
//   if (err) {
//     console.error(err);
//     process.exit(0);
//   }
// });
