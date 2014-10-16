
function formatNumberCell(x) {
  // add comma for thousand seperator
  x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return '<span class="pull-right">' + x + '</span>';
}


var mytable;

// Populate the table
$.ajax({
  url: '/api/rids',
  success: function(data){
    // link up the table
    mytable = $('#rids-table').dynatable({
      dataset: {
        records: data
      },
      features: {
        paginate: true,
        recordCount: false,
        sorting: true,
        perPage:25
      },
      inputs: {
        queries: $('#date-range')
      },
      writers: {
        'usersNew': function (record) {
          return formatNumberCell(record.usersNew);
        },
        'usersExisting': function (record) {
          return formatNumberCell(record.usersExisting);
        },
        'makersNew': function (record) {
          return formatNumberCell(record.makersNew);
        },
        'mvcBadgeNew': function (record) {
          return formatNumberCell(record.mvcBadgeNew);
        },
        'mvcBadgeExisting': function (record) {
          return formatNumberCell(record.mvcBadgeExisting);
        },
        'eventHostsNew': function (record) {
          return formatNumberCell(record.eventHostsNew);
        },
        'mentorsNew': function (record) {
          return formatNumberCell(record.mentorsNew);
        },
        'mentorsExisting': function (record) {
          return formatNumberCell(record.mentorsExisting);
        },
        'superMentorsNew': function (record) {
          return formatNumberCell(record.superMentorsNew);
        },
        'superMentorsExisting': function (record) {
          return formatNumberCell(record.superMentorsExisting);
        },
      }
    }).data(mytable);

    // set to 90 days as default view
    mytable.dynatable.queries.add("periodLengthDays",90);


    mytable.dynatable.sorts.add('mvcBadgeNew', 0);

    mytable.dynatable.process();
  }
});
