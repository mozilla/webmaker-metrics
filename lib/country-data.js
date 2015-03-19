var async = require('async');
var moment = require('moment');
var db = require('../lib/models');
//var util = require('../lib/util');
var ga = require('../lib/googleanalytics');
var netUse = require('../lib/internet-usage-data');

/**
 * Initiates a number crunching excercise for a given date
 * @param  {date}   snapshotDate - format('YYYY-MM-DD')
 * @param  {Function} callback
 * @return {string} error
 */
function runCrunchForCountryData (snapshotDate, callback) {
  'use strict';

  var args = {
    snapshotDate: snapshotDate
  };
  ga.uvsByCountry30Days(args, function (err, res) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    var totalUVs = 0;
    var totalInternetUsers = 0;

    var gaCountries = res.rows;
    async.eachLimit(gaCountries, 10, function(countryRow, callback) {

      var countryName = countryRow[0];
      var countryUVCount = parseInt(countryRow[1]);

      // do we have usage data for this country?
      var countryInternetUsers = netUse.internetUsers(countryName);
      if (!countryInternetUsers) {
        console.info('No data for:', countryName);
        // if not, skip
        return callback();
      }

      // increment the totals
      totalUVs += countryUVCount;
      totalInternetUsers += countryInternetUsers;

      var snapshotToSave = {
        snapshotDate: snapshotDate,
        country: countryName,
        UVs30days: countryUVCount,
        UVsToInternetUsers: countryUVCount / countryInternetUsers,
        InternetUsers: countryInternetUsers
      };

      db.CountryDataSnapshot.upsert(snapshotToSave)
        .then(function () {
          return callback();
        }
      );
    },
    function(err){
        if( err ) {
          console.log(err);
          return callback(err);
        }

        // Save the totals for the same day for easy reporting
        var snapshotToSave = {
          snapshotDate: snapshotDate,
          country: 'Total',
          UVs30days: totalUVs,
          UVsToInternetUsers: totalUVs / totalInternetUsers,
          InternetUsers: totalInternetUsers
        };

        db.CountryDataSnapshot.upsert(snapshotToSave)
          .then(function () {
            console.log('Finished crunching country data');
            return callback();
          }
        );
    });
  });
}


/**
 * The main function for Country data.
 * @param  {Function} callback
 * @return {err, String}
 */
function updateCountryData (callback) {
  'use strict';

    // integration DB updates daily, so we look at stats up until yesterday
    var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    runCrunchForCountryData(yesterday, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Country crunch run complete');
    });
}

/**
 * backdataCountryData
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function backdataCountryData (callback) {
  'use strict';
  var datesWeCareAbout = [];
  for (var i = 0; i <= 60; i++) {
    datesWeCareAbout.push(moment().subtract(1 + i, 'days').format('YYYY-MM-DD'));
  }
  async.eachSeries(datesWeCareAbout, function(date, callback) {
    runCrunchForCountryData(date, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, 'Crunch run complete for ' + date);
    });
  }, function(err){
    if( err ) {
      return callback(err);
    }
    console.log('Finished running updateProductFunnel7Days()');
    return callback();
  });
}



module.exports = {
  updateCountryData: updateCountryData,
  backdataCountryData: backdataCountryData
};
