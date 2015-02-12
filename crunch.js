var async = require('async');
var webmakerMetrics = require('./lib/webmaker-metrics.js');
var appmaker = require('./lib/appmaker_temp.js');

// webmakerMetrics.updateRIDMetrics(function (err, res) {
//   'use strict';
//   if (err) {
//     console.error(err);
//     process.exit(0);
//   }
//   console.log(res);
//   //process.exit(0);
// });

// webmakerMetrics.updateEngagementMetrics(function (err, res) {
//   'use strict';
//   if (err) {
//     console.error(err);
//     process.exit(0);
//   }
// });


async.series({

    appmaker: function(callback){

        // UPDATE APPMAKER SCRAPER
        // Appmaker makers are in a MongoDB.
        // This hack polls the MakeAPI to copy into MySQL the create time of each make
        appmaker.refreshStats(function (err) {
          'use strict';
          if (err) {
            console.error(err);
          }
          console.log('Finished Running appmaker.refreshStats()');
          return callback(null);
        });
    },

    productKPIs: function(callback){

        webmakerMetrics.updateWebmakerProductFunnel(function (err, res) {
          'use strict';
          if (err) {
            console.error(err);
          }
          console.log('Finished Running webmakerMetrics.updateWebmakerProductFunnel()');
          return callback(null);
        });
    }
},
function(err, results) {
  console.log('bazra');
    console.log('Finished Running crunch.js');
});






