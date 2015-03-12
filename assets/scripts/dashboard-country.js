/*
 GRAPH
 */

var torso = {};
    torso.width = 700;
    torso.height = 200;
    torso.right = 20;

d3.json('/api/target-countries', function(data) {

  data = convert_dates(data, 'date');
  //add a line chart that has a few observations
  data_graphic({
    title: null,
    data: data,
    //interpolate: 'basic',
    full_width: true,
    width: torso.width,
    height: torso.height * 3 / 2,
    right: torso.right,
    target: '#graph-target-countries',
    x_accessor: 'date',
    y_accessor: ['India', 'Brazil', 'Bangladesh', 'Kenya', 'United Kingdom'],
    legend: ['India', 'Brazil', 'Bangladesh', 'Kenya', 'United Kingdom'],
    legend_target: '.legend',
    area: false,
    decimals: 3,
    format: 'Percentage',
    y_axis: true,
    x_axis: false
  });
});

/*
 TABLE
 */

function formatNumberCell(x) {
  // add comma for thousand seperator
  x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return '<span class="pull-right">' + x + '</span>';
}

function formatPercentCell(x) {
  x = x * 100;
  return '%' + x.toFixed(3);
}

function formatCountry(x) {
  if (x === 'Total') {
    x = 'Average';
  }

  var highlightCountries = [
    'Average',
    'India',
    'Bangladesh',
    'Brazil',
    'Kenya'
  ];

  if (highlightCountries.indexOf(x) !== -1) {
    return '<strong>' + x + '</strong>';
  }

  return x;
}


var mytable;

// Populate the table
$.ajax({
  url: '/api/country',
  success: function(data){
    // link up the table
    mytable = $('#country-table').dynatable({
      dataset: {
        records: data
      },
      features: {
        paginate: false,
        recordCount: false,
        sorting: true,
        perPage:50
      },
      inputs: {
        //queries: $('#date-range')
      },
      writers: {
        'country': function (record) {
          return formatCountry(record.country);
        },
        'UVsToInternetUsers': function (record) {
          return formatPercentCell(record.UVsToInternetUsers);
        },
        'UVs30days': function (record) {
          return formatNumberCell(record.UVs30days);
        },
        'InternetUsers': function (record) {
          return formatNumberCell(record.InternetUsers);
        }
      }
    }).data(mytable);

    // // set to 90 days as default view
    // mytable.dynatable.queries.add("periodLengthDays",90);


    mytable.dynatable.sorts.add('UVsToInternetUsers', 0);

    mytable.dynatable.process();
  }
});
