// cachekill util
var currentdate = new Date();
var cacheKill = '?ck='
                + currentdate.getFullYear()
                + currentdate.getMonth()
                + currentdate.getDay()
                + currentdate.getHours();

var small = {};
    small.width = 450;
    small.height = 200;
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

var startOf2015 = new Date(2015,01,01);
var endOf2015 = new Date(2015,12,31);

// cities
d3.json('/api/learning-network-cities'+cacheKill, function(data) {

  var goal = 500;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [{value:goal, label:'target'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-cities',
    x_accessor: 'date',
    y_accessor: 'value',
    area: true,
    x_axis: true,
    min_x: startOf2015,
    max_x: endOf2015,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-cities').html(mostRecentValue);
  $('#inputCities').val(mostRecentValue);
  //d3.select('#latest-date').text(getMostRecentDate(data));
});

// People
d3.json('/api/learning-network-people'+cacheKill, function(data) {

  var goal = 4000;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [{value:goal, label:'target'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-people',
    x_accessor: 'date',
    y_accessor: 'value',
    area: true,
    x_axis: true,
    min_x: startOf2015,
    max_x: endOf2015,
    baselines: baselines,
    max_y: max_y
  });
  $('#inputPeople').val(mostRecentValue);
  d3.select('#total-people').html(mostRecentValue);
});

// Hive Cities
d3.json('/api/learning-network-hive-cities'+cacheKill, function(data) {

  var goal = 10;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [{value:goal, label:'target'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-hive-cities',
    x_accessor: 'date',
    y_accessor: 'value',
    area: true,
    x_axis: true,
    min_x: startOf2015,
    max_x: endOf2015,
    baselines: baselines,
    max_y: max_y
  });
  $('#inputHiveCities').val(mostRecentValue);
  d3.select('#total-hive-cities').html(mostRecentValue);
});

// Clubs
d3.json('/api/learning-network-clubs'+cacheKill, function(data) {

  var goal = 600;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [{value:goal, label:'target'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-clubs',
    x_accessor: 'date',
    y_accessor: 'value',
    area: true,
    x_axis: true,
    min_x: startOf2015,
    max_x: endOf2015,
    baselines: baselines,
    max_y: max_y
  });
  $('#inputClubs').val(mostRecentValue);
  d3.select('#total-clubs').html(mostRecentValue);
});

