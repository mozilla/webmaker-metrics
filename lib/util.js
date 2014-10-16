var moment = require('moment');

/**
 * Generates and array of arrays for the date ranges we want to report on
 * @return {array}
 */
function engagementMetricsDateRanges () {
  'use strict';

  var dateRanges = [];

  // 1. Monthly ranges
  var now = moment();
  var monthToCount = moment('2014-01-01', 'YYYY-MM-DD');

  while(monthToCount < now) {
    // endOf and startOf mutate the object
    // so in this order we finish up with the start date
    // to move to the next month
    var end = monthToCount.endOf('month').format('YYYY-MM-DD');
    var start = monthToCount.startOf('month').format('YYYY-MM-DD');

    dateRanges.push([start, end]);
    monthToCount = monthToCount.add(1, 'months');
  }

  // 2. Daily ranges
  var dayToCount = moment('2014-01-01', 'YYYY-MM-DD');
  while(dayToCount < now) {
    var day = dayToCount.format('YYYY-MM-DD');
    // start and end date are the same when the range is one day
    dateRanges.push([day, day]);
    dayToCount = dayToCount.add(1, 'days');
  }

  return dateRanges;
}


/**
 * Checks if a string ends with another string
 * @param  {str} str
 * @param  {str} suffix
 * @return {boolean}
 */
function endsWith(str, suffix) {
  'use strict';
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * checks if a string (email address) ends with one of the valid domains passed in as an array
 * @param  {str}  str
 * @param  {Array}  validDomains
 * @return {Boolean}
 */
function isValidEmail(str, validDomains) {
  'use strict';
  for (var i = validDomains.length - 1; i >= 0; i--) {
    if (endsWith(str, validDomains[i])) {
      return true;
    }
  }
  return false;
}

/**
 * Get the substring up to any @ symbol (to get username bit of an email)
 * @param  {String} s
 * @return {String} substring
 */
function allBeforeTheAt(s) {
  if (s.indexOf('@') === -1) {
    return s;
  } else {
    return s.substr(0, s.indexOf('@'));
  }
}


module.exports = {
  engagementMetricsDateRanges: engagementMetricsDateRanges,
  isValidEmail: isValidEmail,
  allBeforeTheAt: allBeforeTheAt,
};


