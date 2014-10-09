var webmakerMetrics = require('./lib/webmaker-metrics.js');

// webmakerMetrics.checkAndCrunch(function (err, res) {
//   'use strict';
//   if (err) {
//     console.error(err);
//     process.exit(0);
//   }
//   console.log(res);
//   //process.exit(0);
// });

webmakerMetrics.updateEngagementMetrics(function (err, res) {
  'use strict';
  if (err) {
    console.error(err);
    process.exit(0);
  }
});
