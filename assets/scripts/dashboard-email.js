var small = {};
    small.width = 450;
    small.height = 160;
    small.left = 20;
    small.right = 20;
    small.top = 20;



// 1 day opt-in rate
d3.json('/api/email-optins-1day' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q1'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
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
  d3.select('#latest-date').text(util.getMostRecentDate(data));
});


// 1 day opt-in rate
d3.json('/api/email-optin-1day' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q1'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
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
    format: 'Percentage',
    max_y: max_y
  });

  d3.select('#total-optin-1day').html(util.numberAsPercent(mostRecentValue, 1));
});

// 30 day opt-in rate
d3.json('/api/email-optin-30days' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q1'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
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
    format: 'Percentage',
    max_y: max_y
  });

  d3.select('#total-optin-30days').html(util.numberAsPercent(mostRecentValue, 1));
});

