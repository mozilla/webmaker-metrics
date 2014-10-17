if (!global.hasOwnProperty('db')) {

  var Sequelize = require('sequelize');

  var sequelizeOptions = {};
  sequelizeOptions.port = process.env.METRICS_DB_PORT;
  sequelizeOptions.host = process.env.METRICS_DB_HOST;
  sequelizeOptions.dialect = 'mysql';

  if (process.env.INTEGRATION_DB_SSL) {
    // SSL is used for Amazon RDS, but not necessarily for local dev
    sequelizeOptions.dialectOptions = { ssl:'Amazon RDS' };
  }

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

  // Model for storing the aggregate records
  var Aggregate = sequelize.define('Aggregate', {
    periodEndDate: Sequelize.DATE,
    periodLengthDays: Sequelize.INTEGER,
    referralCode: Sequelize.STRING,
    usersNew: Sequelize.INTEGER,
    usersExisting: Sequelize.INTEGER,
    mvcBadgeNew: Sequelize.INTEGER,
    mvcBadgeExisting: Sequelize.INTEGER,
    eventHostsNew: Sequelize.INTEGER,
    mentorsNew: Sequelize.INTEGER,
    mentorsExisting: Sequelize.INTEGER,
    superMentorsNew: Sequelize.INTEGER,
    superMentorsExisting: Sequelize.INTEGER,
    makersNew: Sequelize.INTEGER,
  });

  var EnagementMetric = sequelize.define('EnagementMetric', {
    dateCrunched: Sequelize.DATE,
    startDateInclusive: Sequelize.DATE,
    endDateInclusive: Sequelize.DATE,
    visits: Sequelize.INTEGER,
    visitsNonBouncing: Sequelize.INTEGER,
    usersActive: Sequelize.INTEGER,
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
