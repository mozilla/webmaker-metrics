
/**
 * PERSONA
 */

var login = document.querySelector("#login");
if (login) {
  login.addEventListener("click", function () {
    navigator.id.request({
      siteName: "Webmaker Metrics"
    });
  }, false);
}

var logout = document.querySelector("#logout");
if (logout) {
  logout.addEventListener("click", function () {
    navigator.id.logout();
  }, false);
}

var token = $("meta[name='csrf-token']").attr("content");
var currentUser = $("meta[name='persona-email']").attr("content");
if (!currentUser) {
  currentUser = null; // specifically set to null to avoid persona looping on logout
}

navigator.id.watch({
  loggedInUser: currentUser,
  onlogin: function (assertion) {
    $.ajax({
      type: 'POST',
      url: '/persona/verify',
      data: {
        assertion: assertion,
        _csrf: token
      },
      success: function (res, status, xhr) {
        if (res.status === 'okay') {
          window.location.reload();
        } else {
          window.alert(res.reason);
        }
      },
      error: function (xhr, status, err) {
        navigator.id.logout();
        window.alert("Login failure: " + err);
      }
    });
  },
  onlogout: function () {
    $.ajax({
      type: 'POST',
      url: '/persona/logout',
      data: {
        _csrf: token
      },
      success: function (res, status, xhr) {
        window.location.reload();
      },
      error: function (xhr, status, err) {
        window.alert("Logout failure: " + err);
      }
    });
  }
});

// Utilities
var util = {
  numberAsPercent: function (value, decimalPlaces) {
    var decimalPlaces = decimalPlaces || 2;
    value = value * 100;
    return value.toFixed(decimalPlaces) + '%';
  },

  cacheKill: function () {
    var currentdate = new Date();
    var s = '?ck='
                + currentdate.getFullYear()
                + currentdate.getMonth()
                + currentdate.getDay()
                + currentdate.getHours();
    return s;
  },

  yMaxFromDataOrGoal: function (maxFromData, goal) {
    if (maxFromData >= goal) {
      return maxFromData * 1.1;
    }
    return goal * 1.1;
  },

  getMostRecentValue: function (data) {
    var latestDateInData = d3.max(data, function(d) { return new Date(d.date); });
    latestDateInData = latestDateInData.yyyymmdd();
    var value;
    for (var i = 0; i < data.length; i++) {
      if (data[i].date === latestDateInData) {
        value = data[i].value;
      }
    }
    return value;
  },

  getMostRecentDate: function (data) {
    var latestDateInData = d3.max(data, function(d) { return new Date(d.date); });
    latestDateInData = latestDateInData.yyyymmdd();
    return latestDateInData;
  },

  numberWithCommas: function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  startOf2015: function () {
    return new Date(2015,0,01); // month is 0 index
  },

  endOf2015: function () {
    return new Date(2015,11,31); // month is 0 index
  },

  formatNumberCell: function (x) {
    // add comma for thousand seperator
    x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return '<span class="pull-right">' + x + '</span>';
  }

};

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + '-' +(mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
};

