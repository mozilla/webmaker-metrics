// cachekill util
var currentdate = new Date();
var cacheKill = '?ck='
                + currentdate.getFullYear()
                + currentdate.getMonth()
                + currentdate.getDay()
                + currentdate.getHours();

var small = {};
    small.width = 450;
    small.height = 160;
    small.left = 20;
    small.right = 20;
    small.top = 20;

function yMaxFromDataOrGoal (maxFromData, goal) {
  if (maxFromData >= goal) {
    return maxFromData * 1.1;
  }
  return goal * 1.1;
}

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + '-' +(mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
};

function getMostRecentValue (data) {
  var latestDateInData = d3.max(data, function(d) { return new Date(d.date); });
  latestDateInData = latestDateInData.yyyymmdd();
  var value;
  for (var i = 0; i < data.length; i++) {
    if (data[i].date === latestDateInData) {
      value = data[i].value;
    }
  }
  return value;
}

function getMostRecentDate (data) {
  var latestDateInData = d3.max(data, function(d) { return new Date(d.date); });
  latestDateInData = latestDateInData.yyyymmdd();
  return latestDateInData;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberAsPercent(x) {
  return x.toFixed(2) + '%';
}

// 1 day opt-in rate
d3.json('/api/email-optins-1day'+cacheKill, function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q1'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-optins-1day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-optins-1day').html(mostRecentValue);
  d3.select('#latest-date').text(getMostRecentDate(data));
});

// 1 day opt-in rate
d3.json('/api/email-optin-1day'+cacheKill, function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q1'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-optin-1day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-optin-1day').html(numberAsPercent(mostRecentValue));
});

// 30 day opt-in rate
d3.json('/api/email-optin-30days'+cacheKill, function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q1'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-optin-30days',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-optin-30days').html(numberAsPercent(mostRecentValue));
});

