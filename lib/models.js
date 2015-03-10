if (!global.hasOwnProperty('db')) {

  var Sequelize = require('sequelize');

  var sequelizeOptions = {};
  sequelizeOptions.port = process.env.METRICS_DB_PORT;
  sequelizeOptions.host = process.env.METRICS_DB_HOST;
  sequelizeOptions.dialect = 'mysql';

  if (process.env.METRICS_DB_SSL) {
    // SSL is used for Amazon RDS, but not necessarily for local dev
    sequelizeOptions.dialectOptions = {
      'SSL_VERIFY_SERVER_CERT': './cert/amazon-rds-ca-cert.pem'
    };
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

  // Model for storing the RID records
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

  var ProductFunnelSnapshot = sequelize.define('ProductFunnelSnapshot', {
    snapshotDate: Sequelize.DATE,
    UVs: Sequelize.INTEGER,
    AUs: Sequelize.INTEGER,
    NewUsers: Sequelize.INTEGER,
    EUs: Sequelize.INTEGER,
    UVtoAU: Sequelize.DECIMAL(6,5),
    UVtoNewUser: Sequelize.DECIMAL(6,5),
    UVtoEU: Sequelize.DECIMAL(6,5),
    AUtoEU: Sequelize.DECIMAL(6,5),
    AU7dayRetention: Sequelize.DECIMAL(6,5),
    AU30dayRetention: Sequelize.DECIMAL(6,5),
    AU90dayRetention: Sequelize.DECIMAL(6,5)
  });

  var EmailOptinSnapshot = sequelize.define('EmailOptinSnapshot', {
    snapshotDate: Sequelize.DATE,
    NewUsers1day: Sequelize.INTEGER,
    NewUserOptins1day: Sequelize.INTEGER,
    NewUserOptinRate1day: Sequelize.DECIMAL(6,5),
    NewUsers7days: Sequelize.INTEGER,
    NewUserOptins7days: Sequelize.INTEGER,
    NewUserOptinRate7days: Sequelize.DECIMAL(6,5),
    NewUsers30days: Sequelize.INTEGER,
    NewUserOptins30days: Sequelize.INTEGER,
    NewUserOptinRate30days: Sequelize.DECIMAL(6,5)
  });

  var LearningNetworkSnapshot = sequelize.define('LearningNetworkSnapshot', {
    snapshotDate: {type: Sequelize.DATE, unique: true},
    people: Sequelize.INTEGER,
    cities: Sequelize.INTEGER,
    clubs: Sequelize.INTEGER,
    hiveCities: Sequelize.INTEGER,
    loggedBy: Sequelize.STRING
  });

  var PersistKey = sequelize.define('PersistKey', {
    key: Sequelize.STRING,
    value: Sequelize.STRING
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
    ProductFunnelSnapshot: ProductFunnelSnapshot,
    EmailOptinSnapshot: EmailOptinSnapshot,
    LearningNetworkSnapshot: LearningNetworkSnapshot,
    PersistKey: PersistKey
  };
}

module.exports = global.db;
