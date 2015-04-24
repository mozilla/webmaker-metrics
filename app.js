'use strict';

var express = require('express');
var logfmt = require('logfmt');
var util = require('./lib/util.js');
var reporting = require('./lib/reporting.js');
var enforce = require('express-sslify');
var helmet = require('helmet');
var https = require('https');
var fs = require('fs');
var ga = require('./lib/googleanalytics');
var webmakerMetrics = require('./lib/webmaker-metrics.js');
var countryData = require('./lib/country-data.js');
var auth = require('http-auth');
var geckoboardJSON = require('geckoboard-json');
var moment = require('moment');
var db = require('./lib/models');

var app = express();

var cspPolicy = {
  'default-src': ['\'self\'', 'https://login.persona.org'],
  'script-src': ['\'self\'', 'https://login.persona.org'],
  'style-src': ['\'self\'', '\'unsafe-inline\'', 'fonts.googleapis.com', 'netdna.bootstrapcdn.com']
};

// set up handlebars view engine
var handlebars = require('express3-handlebars').create({
  defaultLayout: 'main'
});
handlebars.loadPartials();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(logfmt.requestLogger());
app.use(express.favicon());
app.use(enforce.HTTPS(true));
app.use(express.urlencoded());
app.use(express.cookieParser(process.env.COOKIE_SECRET));
app.use(express.session({
  secret: process.env.COOKIE_SECRET,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: true,
  },
}));
app.use(express.csrf());
app.use(function (req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.locals.token = req.csrfToken();
  next();
});
var ninetyDaysInMilliseconds = 7776000000;
app.use(helmet.hsts({ maxAge: ninetyDaysInMilliseconds }));  // HTTP Strict Transport Security
//app.use(helmet.xframe('deny')); // X-Frame-Options
app.use(helmet.csp(cspPolicy));
app.use(helmet.xssFilter());
app.use(helmet.nosniff());
app.use(helmet.hidePoweredBy());
app.use(app.router);
app.use(express.static(__dirname + '/assets'));


/** ================================
 * BASIC AUTH as an extra layer over GA auth
 ================================ */
var basic = auth.basic({
        realm: "Web."
    }, function (username, password, callback) { // Custom authentication method.
        callback(username === process.env.LOCAL_AUTH_USERNAME && password === process.env.LOCAL_AUTH_PASSWORD);
    }
);

/** ================================
 * LOGIN
 ================================ */

// middleware to restrict access to internal routes
function restrict(req, res, next) {
  if (req.session.authorized) {
    next();
  } else {
    req.session.targetURL = req.url;
    res.redirect('/');
  }
}

// persona
require('express-persona')(app, {
  audience: process.env.HOST, // Must match your browser's address bar
  verifyResponse: function (err, req, res, email) {
    if (util.isValidEmail(email, ['@mozillafoundation.org', '@mozilla.com'])) {
      req.session.authorized = true;
      res.json({
        status: 'okay',
        email: email
      });
      return;
    } else {
      console.log('Login attempt by: ', req.session.email);
      req.session.email = null;
      req.session.authorized = null;
      res.json({
        status: 'failure',
        reason: 'Only users with a mozillafoundation.org or mozilla.com email address may use this tool'
      });
    }
  },
  logoutResponse: function (err, req, res) {
    if (req.session.authorized) {
      req.session.authorized = null;
    }

    res.json({
      status: 'okay'
    });
  }
});


/** ================================
 * ROUTES
 ================================ */

app.get('/', function (req, res) {
  if (req.session.authorized) {
    if (req.session.targetURL) {
      res.redirect(req.session.targetURL);
    } else {
      res.redirect('/dashboards');
    }
  } else {
    res.redirect('/dashboards');
  }
});

function renderDashboardPage(req, res, viewName) {
  var email = req.session.email;
  var username = util.allBeforeTheAt(email);
  var templateValues = {
    currentUser: email,
    username: username,
    authorized: (req.session.authorized),
    pageJS: viewName,
  };

  res.render(viewName, templateValues);
}

/** ================================
 * PUBLIC ROUTES
 ================================ */

app.get('/dashboards', function (req, res) {
  renderDashboardPage(req, res, 'dashboards');
});

app.get('/dashboard/product-kpis', function (req, res) {
  renderDashboardPage(req, res, 'dashboard-product-kpis');
});

app.get('/dashboard/email', function (req, res) {
  renderDashboardPage(req, res, 'dashboard-email');
});

app.get('/dashboard/country', function (req, res) {
  renderDashboardPage(req, res, 'dashboard-country');
});

app.get('/dashboard/learning-networks', function (req, res) {
  renderDashboardPage(req, res, 'dashboard-learning-networks');
});

app.get('/dashboard/mofo-kpis', function (req, res) {
  renderDashboardPage(req, res, 'dashboard-mofo-kpis');
});

/** ================================
 * RESTRICTED ROUTES
 ================================ */

app.get('/dashboard/rids', restrict, function (req, res) {
  renderDashboardPage(req, res, 'dashboard-rids');
});

app.get('/dashboard/learning-networks/submit', restrict, function (req, res) {
  var snapshotDate = moment().format('YYYY-MM-DD');
  var snapshot = {
    snapshotDate: snapshotDate,
    people: req.query.inputPeople,
    cities: req.query.inputCities,
    clubs: req.query.inputClubs,
    hiveCities: req.query.inputHiveCities,
    loggedBy: req.session.email
  };
  db.LearningNetworkSnapshot.upsert(snapshot)
    .then(function () {
      res.redirect('/dashboard/learning-networks?latestNumbersAdded');
    }
  );
});

/** ================================
 * APIS (PUBLIC)
 ================================ */

app.get('/api/country', function (req, res) {
  reporting.latestCountryData(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/target-countries', function (req, res) {
  reporting.targetCountries(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/product-uvs', function (req, res) {
  reporting.productUVs(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/product-uvtonewuser', function (req, res) {
  reporting.productUVtoNewUser(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/product-uvtoau', function (req, res) {
  reporting.productUVtoAU(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/product-retention-7day', function (req, res) {
  reporting.productRetention7Day(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/product-retention-30day', function (req, res) {
  reporting.productRetention30Day(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/product-retention-90day', function (req, res) {
  reporting.productRetention90Day(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/product-UVtoEU', function (req, res) {
  reporting.productUVtoEU(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/product-AUtoEU', function (req, res) {
  reporting.productAUtoEU(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/email-optin-1day', function (req, res) {
  reporting.emailOptinRate1day(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/email-optins-1day', function (req, res) {
  reporting.emailOptins1day(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/email-optin-7days', function (req, res) {
  reporting.emailOptinRate7days(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/email-optin-30days', function (req, res) {
  reporting.emailOptinRate30days(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/learning-network-cities', function (req, res) {
  reporting.learningNetworkCities(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/learning-network-people', function (req, res) {
  reporting.learningNetworkPeople(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/learning-network-hive-cities', function (req, res) {
  reporting.learningNetworkHiveCities(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/learning-network-clubs', function (req, res) {
  reporting.learningNetworkClubs(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

app.get('/api/mofo-people', function (req, res) {
  reporting.mofoPeople(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

/** ================================
 * APIS (RESTRICTED)
 ================================ */
app.get('/api/rids', restrict, function (req, res) {
  reporting.latestRIDs(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.json(result);
  });
});

/** ================================
 * GECKOBOARD APIs (PUBLIC)
 ================================ */


app.get('/api/public/geckoboard/product-uvtonewuser/line', function (req, res) {
  reporting.productUVtoNewUser(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    var sorted = util.sortArrayOfObjectsByDate(result, 'date');
    var transformed = geckoboardJSON.highChartLineChart(sorted, 'value', 'date', {usingDates: true});
    res.json(transformed);
  });
});

app.get('/api/public/geckoboard/product-uvtonewuser/number', function (req, res) {
  reporting.productUVtoNewUser(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    console.log(result);
    var mostRecent = util.getMostRecentValue(result, 'date', 'value');
    var rounded = Math.round(mostRecent * 100) / 100;
    var transformed = geckoboardJSON.numberAndSecondaryStat(rounded, 'UV to New User', {usingDates: true});
    res.json(transformed);
  });
});

app.get('/api/public/geckoboard/product-retention-7day/line', function (req, res) {
  reporting.productRetention7Day(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    var sorted = util.sortArrayOfObjectsByDate(result, 'date');
    var transformed = geckoboardJSON.highChartLineChart(sorted, 'value', 'date', {usingDates: true});
    res.json(transformed);
  });
});

app.get('/api/public/geckoboard/product-retention-7day/number', function (req, res) {
  reporting.productRetention7Day(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    console.log(result);
    var mostRecent = util.getMostRecentValue(result, 'date', 'value');
    var rounded = Math.round(mostRecent * 100) / 100;
    var transformed = geckoboardJSON.numberAndSecondaryStat(rounded, '7 Day Retention Rate', {usingDates: true});
    res.json(transformed);
  });
});

app.get('/api/public/geckoboard/product-retention-30day/line', function (req, res) {
  reporting.productRetention30Day(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    var sorted = util.sortArrayOfObjectsByDate(result, 'date');
    var transformed = geckoboardJSON.highChartLineChart(sorted, 'value', 'date', {usingDates: true});
    res.json(transformed);
  });
});

app.get('/api/public/geckoboard/product-retention-30day/number', function (req, res) {
  reporting.productRetention30Day(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    console.log(result);
    var mostRecent = util.getMostRecentValue(result, 'date', 'value');
    var rounded = Math.round(mostRecent * 100) / 100;
    var transformed = geckoboardJSON.numberAndSecondaryStat(rounded, '30 Day Retention Rate', {usingDates: true});
    res.json(transformed);
  });
});

/** ================================
 * UTILS
 ================================ */

app.get('/util/crunch7daysProduct', restrict, function (req, res) {
  webmakerMetrics.updateProductFunnel7Days(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.redirect('/dashboards/?crunched7daysProduct');
  });
});

app.get('/util/crunch7daysEmail', restrict, function (req, res) {
  webmakerMetrics.updateEmailOptins7Days(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.redirect('/dashboards/?crunched7daysEmail');
  });
});

app.get('/util/backdateCountryData', restrict, function (req, res) {
  countryData.backdataCountryData(function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({status: 'Internal Server Error'});
    }
    res.redirect('/dashboards/?backdatedCountryData');
  });
});

/** ================================
 * GA AUTH
 ================================ */

// GA AUTH
app.get('/ga/auth', auth.connect(basic), function (req, res) {
  ga.getAuthURL(function (err, url) {
    res.redirect(url);
  });
});

app.get('/ga/oauth2callback', auth.connect(basic), function (req, res) {
  var code = req.param('code');
  if (!code) {
    res.json({'Error':'Missing authentication code from GA redirect'});
    return;
  }

  ga.updateAuthTokens(code, function (err, response) {
    if (err) {
      res.json({"Error": err});
      return;
    }
    console.log('Updated Auth Tokens');
    res.redirect('/ga/done');
  });
});

app.get('/ga/done', auth.connect(basic), function (req, res) {
  res.send('Done<br><a href="/ga/auth/">Again</a>');
});

/** ================================
 * SERVER
 ================================ */

var port = Number(process.env.PORT || 5000);

app.configure('production', function () {
  // production uses Heroku's SSL not our local test certificates
  app.listen(port, function () {
    console.log('Listening on ' + port);
  });
});

app.configure('development', function () {
  // Localhost HTTPS
  var options = {
    key: fs.readFileSync('./config/key.pem'),
    cert: fs.readFileSync('./config/cert.pem')
  };
  https.createServer(options, app).listen(port, function () {
    console.log('Express server listening on port ' + port);
  });
});
