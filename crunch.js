var async = require('async');
var webmakerMetrics = require('./lib/webmaker-metrics.js');
var appmaker = require('./lib/appmaker_temp.js');
var countryData = require('./lib/country-data.js');
var opts = require("nomnom").parse();

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

/**
 * CRUNCH FUNCTIONS
 */

/**
 * Appmaker make scraper.
 * Appmaker makers are in a MongoDB.
 * This hack polls the MakeAPI to copy into MySQL the create time of each make
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function appmaker (callback){
  appmaker.refreshStats(function (err) {
    'use strict';
    if (err) {
      console.error(err);
    }
    console.log('Finished Running appmaker.refreshStats()');
    return callback(null);
  });
}

/**
 * Crunch numbers for Product KPIs
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function productKPIs(callback){
  webmakerMetrics.updateWebmakerProductFunnel(function (err, res) {
    'use strict';
    if (err) {
      console.error(err);
    }
    console.log('Finished Running webmakerMetrics.updateWebmakerProductFunnel()');
    return callback(null);
  });
}

function emailOptins(callback){
  webmakerMetrics.updateEmailOptins(function (err, res) {
    'use strict';
    if (err) {
      console.error(err);
    }
    console.log('Finished Running webmakerMetrics.updateEmailOptins()');
    return callback(null);
  });
}

function updateRelationships(callback){
  webmakerMetrics.updateRelationships(function (err, res) {
    'use strict';
    if (err) {
      console.error(err);
    }
    console.log('Finished Running webmakerMetrics.updateRelationships()');
    return callback(null);
  });
}

function backdateRelationships(callback){
  webmakerMetrics.backdateRelationships(function (err, res) {
    'use strict';
    if (err) {
      console.error(err);
    }
    console.log('Finished Running webmakerMetrics.backdateRelationships()');
    return callback(null);
  });
}

function updateCountry(callback){
  countryData.updateCountryData(function (err, res) {
    'use strict';
    if (err) {
      console.error(err);
    }
    console.log('Finished Running countryData.updateCountryData()');
    return callback(null);
  });
}

function backdateCountry(callback){
  countryData.backdataCountryData(function (err, res) {
    'use strict';
    if (err) {
      console.error(err);
    }
    console.log('Finished Running countryData.backdataCountryData()');
    return callback(null);
  });
}

function backdateProduct(callback){
  webmakerMetrics.updateProductFunnel7Days(function (err, res) {
    'use strict';
    if (err) {
      console.error(err);
    }
    console.log('Finished Running webmakerMetrics.updateProductFunnel7Days()');
    return callback(null);
  });
}

/**
 * CRUNCH LOGIC
 */


if (opts[0]) {
  // If we're testing, we can pass in specific things to crunch
  // to save running the whole suite every time
  var toRun = opts[0];
  console.log('Trying to run method', toRun);

  if (toRun === 'appmaker') {
    appmaker(function (err) {
      console.log('Ran appmaker');
    });
  }

  if (toRun === 'productKPIs') {
    productKPIs(function (err) {
      console.log('Ran productKPIs');
    });
  }

  if (toRun === 'emailOptins') {
    emailOptins(function (err) {
      console.log('Ran emailOptins');
    });
  }

  if (toRun === 'updateRelationships') {
    updateRelationships(function (err) {
      console.log('Ran updateRelationships');
    });
  }

  if (toRun === 'backdateRelationships') {
    backdateRelationships(function (err) {
      console.log('Ran backdateRelationships');
    });
  }

  if (toRun === 'updateCountry') {
    updateCountry(function (err) {
      console.log('Ran updateCountry');
    });
  }

  if (toRun === 'backdateCountry') {
    backdateCountry(function (err) {
      console.log('Ran backdateCountry');
    });
  }

  if (toRun === 'backdateProduct') {
    backdateProduct(function (err) {
      console.log('Ran backdateProduct');
    });
  }


} else {
  // Run the whole suite

  async.series({
    appmaker: appmaker,
    productKPIs: productKPIs,
    emailOptins: emailOptins,
    updateCountry: updateCountry
  },
  function(err, results) {
      console.log('Finished running crunch.js');
  });
}









