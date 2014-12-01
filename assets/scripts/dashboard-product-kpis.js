
var small = {};
    small.width = 450;
    small.height = 160;
    small.left = 20;
    small.right = 20;
    small.top = 20;


// UVs
d3.json('/api/product-uvs', function(data) {

  var goal = 7000;
  var max_y = goal * 1.1;
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

  var goal = 10;
  var max_y = goal * 1.1;
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

  var goal = 10;
  var max_y = goal * 1.1;
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
  var max_y = goal * 1.1;
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
        target: '#graph-retention-30day',
        x_accessor: 'date',
        y_accessor: 'value',
        area: false,
        x_axis: false,
        baselines: baselines,
        max_y: max_y
    });
});
