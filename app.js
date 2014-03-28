var app = require('./controllers/api').app;

// Load all API controllers
require('./controllers/api/incident-controller');
require('./controllers/api/report-controller');
require('./controllers/api/source-controller');
require('./controllers/api/trend-controller');
require('./controllers/api/user-controller');

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d", app.get('port'));
});

module.exports = app;
