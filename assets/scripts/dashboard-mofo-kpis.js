var small = {};
    small.width = 450;
    small.height = 200;
    small.left = 20;
    small.right = 20;
    small.top = 20;



// cities
d3.json('/api/learning-network-cities' + util.cacheKill(), function(data) {

  var goal = 500;
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
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-cities',
    x_accessor: 'date',
    y_accessor: 'value',
    area: true,
    x_axis: true,
    min_x: util.startOf2015(),
    max_x: util.endOf2015(),
    baselines: baselines,
    max_y: max_y
  });

  d3.select('#total-cities').html(mostRecentValue);
  //d3.select('#latest-date').text(util.getMostRecentDate(data));
});

// People
d3.json('/api/mofo-people' + util.cacheKill(), function(data) {

  var goal = 250000;
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
    width: small.width,
    height: small.height,
    right: small.right,
    target: '#graph-people',
    x_accessor: 'date',
    y_accessor: 'value',
    area: true,
    x_axis: true,
    min_x: util.startOf2015(),
    max_x: util.endOf2015(),
    baselines: baselines,
    max_y: max_y
  });
  d3.select('#total-people').html(util.numberWithCommas(mostRecentValue));
});



