
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

// UVs
d3.json('/api/product-uvs', function(data) {

  var goal = 15000;
  var maxInData = d3.max(data, function(d) { return d.value; });
  var max_y = yMaxFromDataOrGoal(maxInData, goal);
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
});

// UV to AU conversion rate
d3.json('/api/product-uvtoau', function(data) {

  var goal = 5;
  var maxInData = d3.max(data, function(d) { return d.value; });
  var max_y = yMaxFromDataOrGoal(maxInData, goal);
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
    target: '#graph-uvtoau',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y
  });
});


// 7 day retention
d3.json('/api/product-retention-7day', function(data) {

  var goalQ2 = 10;
  var goalQ3 = 20;
  var maxInData = d3.max(data, function(d) { return d.value; });
  var max_y = yMaxFromDataOrGoal(maxInData, goalQ3);
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
});


// 30 Day Retention
d3.json('/api/product-retention-30day', function(data) {

  var goal = 10;
  var maxInData = d3.max(data, function(d) { return d.value; });
  var max_y = yMaxFromDataOrGoal(maxInData, goal);
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
});
