if (!global.hasOwnProperty('db')) {

  var Sequelize = require('sequelize');

  var sequelizeOptions = {};
  sequelizeOptions.port = process.env.METRICS_DB_PORT;
  sequelizeOptions.host = process.env.METRICS_DB_HOST;
  sequelizeOptions.dialect = 'mysql';

  var sequelize = new Sequelize(process.env.METRICS_DB_NAME,
                                process.env.METRICS_DB_USER,
                                process.env.METRICS_DB_PASSWORD,
                                sequelizeOptions);
  sequelize
    .authenticate()
    .complete(function(err) {
      'use strict';
      if (!!err) {
        console.log('Unable to connect to the database:', err);
      } else {
        console.log('Connection has been established successfully.');
      }
    });

  // Model for storign the aggregate records
  var Aggregate = sequelize.define('Aggregate', {
    dateCrunched: Sequelize.DATE,
    periodEndDate: Sequelize.DATE,
    periodLengthDays: Sequelize.INTEGER,
    referralCode: Sequelize.STRING,
    usersNew: Sequelize.INTEGER,
    usersRepeat: Sequelize.INTEGER,
    learnersNew: Sequelize.INTEGER,
    learnersRepeat: Sequelize.INTEGER,
    mvcBadgeNew: Sequelize.INTEGER,
    mvcBadgeRepeat: Sequelize.INTEGER,
    eventHostNew: Sequelize.INTEGER,
    eventHostRepeat: Sequelize.INTEGER,
    eventSupportNew: Sequelize.INTEGER,
    eventSupportRepeat: Sequelize.INTEGER,
    mentorsNew: Sequelize.INTEGER,
    mentorsRepeat: Sequelize.INTEGER,
    superMentorsNew: Sequelize.INTEGER,
    superMentorsRepeat: Sequelize.INTEGER,
  });

  var EnagementMetric = sequelize.define('EnagementMetric', {
    dateCrunched: Sequelize.DATE,
    startDateInclusive: Sequelize.DATE,
    endDateInclusive: Sequelize.DATE,
    usersActive: Sequelize.INTEGER,
    usersEngaged: Sequelize.INTEGER,
    usersMaking: Sequelize.INTEGER,
    usersTeaching: Sequelize.INTEGER,
  });

  sequelize
    .sync({ force: false })
    .complete(function(err) {
      'use strict';
       if (!!err) {
         console.log('An error occurred while creating the table:', err);
       } else {
         console.log('Tables Created');
       }
    });

  // Singleton
  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    Aggregate: Aggregate,
    EnagementMetric: EnagementMetric,
  };
}

module.exports = global.db;
