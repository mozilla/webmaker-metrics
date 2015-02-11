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


// UVs
d3.json('/api/product-uvs', function(data) {

  var goal = 15000;
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
    target: '#graph-uvs',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-uvs').html(numberWithCommas(mostRecentValue));
  d3.select('#latest-date').text(getMostRecentDate(data));
});

// UV to AU conversion rate
d3.json('/api/product-uvtoau', function(data) {

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
    target: '#graph-uvtoau',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-uvtoau').html(numberAsPercent(mostRecentValue));
});


// UV to New User conversion rate
d3.json('/api/product-uvtonewuser', function(data) {

  var goal = 5;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [{value:goal, label:'target Q1'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-uvtonewuser',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-uvtonewuser').html(numberAsPercent(mostRecentValue));
});


// 7 day retention
d3.json('/api/product-retention-7day', function(data) {

  var goalQ2 = 10;
  var goalQ3 = 20;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goalQ3);
  var baselines = [ {value:goalQ2, label:'target Q2'},
                    {value:goalQ3, label:'target Q3'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-retention-7day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-retention-7day').html(numberAsPercent(mostRecentValue));
});


// 30 Day Retention
d3.json('/api/product-retention-30day', function(data) {

  var goal = 10;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [{value:goal, label:'target Q4'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-retention-30day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-retention-30day').html(numberAsPercent(mostRecentValue));
});

// 30 Day Retention
d3.json('/api/product-retention-90day', function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q4'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-retention-90day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-retention-90day').html(numberAsPercent(mostRecentValue));
});


// UVtoEU
d3.json('/api/product-UVtoEU', function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q4'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-UVtoEU',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-UVtoEU').html(numberAsPercent(mostRecentValue));
});

// AUtoEU
d3.json('/api/product-AUtoEU', function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = getMostRecentValue(data);
  var max_y = yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q4'}];

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-AUtoEU',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-AUtoEU').html(numberAsPercent(mostRecentValue));
});
