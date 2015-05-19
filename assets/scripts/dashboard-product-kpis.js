var small = {};
    small.width = 450;
    small.height = 160;
    small.left = 20;
    small.right = 20;
    small.top = 20;



// UVs
d3.json('/api/product-uvs' + util.cacheKill(), function(data) {

  var goal = 19750;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [{value:goal, label:'target'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-uvs',
    x_accessor: 'date',
    y_accessor: 'value',
    area: true,
    x_axis: false,
    baselines: baselines,
    max_y: max_y,
    linked: true
  });

  d3.select('#total-uvs').html(util.numberWithCommas(mostRecentValue));
  d3.select('#latest-date').text(util.getMostRecentDate(data));
});

// New Users
d3.json('/api/product-newusers' + util.cacheKill(), function(data) {

  var goal = 1;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-newusers',
    x_accessor: 'date',
    y_accessor: 'value',
    area: true,
    x_axis: false,
    baselines: baselines,
    max_y: max_y,
    linked: true
  });

  d3.select('#total-newusers').html(util.numberWithCommas(mostRecentValue));
});

// UV to AU conversion rate
d3.json('/api/product-uvtoau' + util.cacheKill(), function(data) {

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
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-uvtoau',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    format: 'Percentage',
    max_y: max_y,
    linked: true
  });

  d3.select('#total-uvtoau').html(util.numberAsPercent(mostRecentValue));
});


// UV to New User conversion rate
d3.json('/api/product-uvtonewuser' + util.cacheKill(), function(data) {

  var goal = 0.05;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [{value:goal, label:'target Q1'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-uvtonewuser',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    format: 'Percentage',
    max_y: max_y,
    linked: true
  });

  d3.select('#total-uvtonewuser').html(util.numberAsPercent(mostRecentValue));
});


// 7 day retention
d3.json('/api/product-retention-7day' + util.cacheKill(), function(data) {

  var goalQ2 = 0.1;
  var goalQ3 = 0.2;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goalQ3);
  var baselines = [ {value:goalQ2, label:'target Q2'},
                    {value:goalQ3, label:'target Q3'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-retention-7day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    format: 'Percentage',
    max_y: max_y,
    linked: true
  });

  d3.select('#total-retention-7day').html(util.numberAsPercent(mostRecentValue));
});

// 7 day retained
d3.json('/api/product-retained-7days' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-retained-7day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y,
    linked: true
  });

  d3.select('#total-retained-7day').html(mostRecentValue);
});


// 30 Day Retention
d3.json('/api/product-retention-30day' + util.cacheKill(), function(data) {

  var goal = 0.1;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [{value:goal, label:'target Q4'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-retention-30day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    format: 'Percentage',
    max_y: max_y,
    linked: true
  });

  d3.select('#total-retention-30day').html(util.numberAsPercent(mostRecentValue));
});

// 30 day retained
d3.json('/api/product-retained-30days' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-retained-30day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y,
    linked: true
  });

  d3.select('#total-retained-30day').html(mostRecentValue);
});

// 30 Day Retention
d3.json('/api/product-retention-90day' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q4'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-retention-90day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    format: 'Percentage',
    max_y: max_y,
    linked: true
  });

  d3.select('#total-retention-90day').html(util.numberAsPercent(mostRecentValue));
});

// 90 day retained
d3.json('/api/product-retained-90days' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-retained-90day',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    max_y: max_y,
    linked: true
  });

  d3.select('#total-retained-90day').html(mostRecentValue);
});


// UVtoEU
d3.json('/api/product-UVtoEU' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q4'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-UVtoEU',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    format: 'Percentage',
    max_y: max_y,
    linked: true
  });

  d3.select('#total-UVtoEU').html(util.numberAsPercent(mostRecentValue));
});

// AUtoEU
d3.json('/api/product-AUtoEU' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = []; //[{value:goal, label:'target Q4'}];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    full_width: true,
    height: small.height,
    right: small.right,
    target: '#graph-AUtoEU',
    x_accessor: 'date',
    y_accessor: 'value',
    area: false,
    x_axis: false,
    baselines: baselines,
    format: 'Percentage',
    max_y: max_y,
    linked: true
  });

  d3.select('#total-AUtoEU').html(util.numberAsPercent(mostRecentValue));
});

// MAUs
d3.json('/api/product-maus' + util.cacheKill(), function(data) {

  var goal = 0;
  var maxValue = d3.max(data, function(d) { return d.value; });
  var mostRecentValue = util.getMostRecentValue(data);
  var max_y = util.yMaxFromDataOrGoal(maxValue, goal);
  var baselines = [];

  data = MG.convert.date(data, 'date');
  //add a line chart that has a few observations
  MG.data_graphic({
    title: null,
    data: data,
    interpolate: 'basic',
    height: small.height,
    right: small.right,
    full_width: true,
    target: '#graph-maus',
    x_accessor: 'date',
    y_accessor: 'value',
    area: true,
    x_axis: false,
    baselines: baselines,
    max_y: max_y,
    linked: true
  });
  d3.select('#total-maus').html(util.numberWithCommas(mostRecentValue));
});
